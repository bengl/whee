const { AsyncLocalStorage } = require('async_hooks');
const send = require('send');
const util = require('util');
const bodies = {
  textBody: require('body'),
  jsonBody: require('body/json'),
  formBody: require('body/form'),
  anyBody: require('body/any')
};
const http = require('http');
const router = require('router');
const methods = require('methods');
const finalHandler = require('finalhandler');

class Router {
  constructor () {
    this.router = router();
  }

  listen (...args) {
    this.server = http.createServer((req, res) => {
      this.router(req, res, finalHandler(req, res));
    });
    this.server.listen(...args);
  }
}

methods.forEach((method) => {
  Router.prototype[method.toLowerCase()] = function (path, cb) {
    this.router[method.toLowerCase()](path, (req, res) => {
      Whee.storage.run({ req }, () => {
        Whee.setMagicValue('req', req);
        Whee.setMagicValue('res', res);
        Whee.setMagicValue('context', {});
        Whee.setMagicValue('urlParams', req.params);
        cb.call(Whee);
      });
    });
    return this;
  };
});

function Whee () {
  return new Router();
}

Whee.setMagicValue = (name, value) => {
  Whee.storage.getStore()[name] = value;
  if (!(name in Whee)) {
    Object.defineProperty(Whee, name, {
      get: () => Whee.storage.getStore()[name]
    });
  }
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
        cb(null, body);
      });
    });
  };
  Whee[funcName].promise = util.promisify(Whee[funcName])
});

module.exports = Whee;
