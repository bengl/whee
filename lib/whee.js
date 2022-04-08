const { AsyncLocalStorage } = require('async_hooks');
const send = require('send');
const util = require('util');
const bodies = {
  textBody: require('body'),
  jsonBody: require('body/json'),
  formBody: require('body/form'),
  anyBody: require('body/any')
};

function Whee () {
  return new (require('./router'))(Whee);
}

Whee.addMagicGetter = (name) => {
  Object.defineProperty(Whee, name, {
    get () {
      return Whee.storage.getStore()[name];
    }
  });
};

Whee.setMagicValue = (name, value) => {
  Whee.storage.getStore()[name] = value;
};

Whee.storage = new AsyncLocalStorage();

Whee.wrap = (f, context) => {
  function wrapped () {
    return f.apply(context || null, [Whee.req, Whee.res, ...arguments]);
  }
  return wrapped;
};

Whee.file = Whee.wrap((req, res, filename) => {
  send(req, filename).pipe(res);
});

Whee.send = Whee.wrap(require('send-data'));
Whee.sendJson = Whee.wrap(require('send-data/json'));
Whee.sendHtml = Whee.wrap(require('send-data/html'));
Whee.sendError = Whee.wrap(require('send-data/error'));
Whee.redirect = Whee.wrap(require('redirecter'));

Object.keys(bodies).forEach((funcName) => {
  const wrapped = Whee.wrap(bodies[funcName]);
  Whee[funcName] = function (opts, cb) {
    if (!cb) {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      } else {
        return Whee[funcName].promise.call(Whee, opts || {})
      }
    }
    const store = Whee.storage.getStore();
    return wrapped(opts, (err, body) => {
      Whee.storage.run(store, () => {
        if (err) return cb(err);
        Whee.setMagicValue('body', body);
        if (!Whee.body) Whee.addMagicGetter('body');
        cb(null, body);
      });
    });
  };
  Whee[funcName].promise = util.promisify(Whee[funcName])
});

['req', 'res', 'context', 'urlParams'].forEach(Whee.addMagicGetter);

module.exports = Whee;
