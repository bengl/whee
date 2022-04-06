const { AsyncLocalStorage } = require('async_hooks');

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
    const args = Array.from(arguments);
    args.unshift(Whee.res);
    args.unshift(Whee.req);
    return f.apply(context || null, args);
  }
  return wrapped;
};

['req', 'res', 'context', 'urlParams'].forEach(Whee.addMagicGetter);

['body', 'send', 'redirect', 'file'].forEach((f) => {
  require('./' + f).call(Whee);
});

module.exports = Whee;
