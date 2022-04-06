const ns = require('continuation-local-storage')
  .createNamespace(require('../package').name);

function Whee () {
  return new (require('./router'))(Whee);
}

Whee.addMagicGetter = function (name) {
  Object.defineProperty(Whee, name, {
    get: function () { return ns.get(name); }
  });
};

Whee.setMagicValue = function (name, value) {
  ns.set(name, value);
};

Whee.wrap = function (f, context) {
  function wrapped () {
    const args = Array.prototype.slice.call(arguments);
    /* if (!Whee.req && !Whee.res) {
      return function(){ wrapped.apply(context, args); }
    } */
    args.unshift(Whee.res);
    args.unshift(Whee.req);
    return f.apply(context || null, args);
  }
  return wrapped;
};

['req', 'res', 'context', 'urlParams'].forEach(Whee.addMagicGetter);

['body', 'send', 'redirect', 'file'].forEach(function (f) {
  require('./' + f).call(Whee);
});

module.exports = Whee;
