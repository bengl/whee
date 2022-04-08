const { AsyncLocalStorage } = require('async_hooks');
const send = require('send');

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

['req', 'res', 'context', 'urlParams'].forEach(Whee.addMagicGetter);

['body', 'send', 'redirect'].forEach((f) => {
  require('./' + f).call(Whee);
});

module.exports = Whee;
