const ns = require('continuation-local-storage')
  .getNamespace(require('../package').name);

const bodies = {
  textBody: require('body'),
  jsonBody: require('body/json'),
  formBody: require('body/form'),
  anyBody: require('body/any')
};

module.exports = function () {
  const self = this;
  Object.keys(bodies).forEach(function (funcName) {
    const wrapped = this.wrap(bodies[funcName]);
    this[funcName] = function (opts, cb) {
      if (!cb && typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      return wrapped(opts, ns.bind(function (err, body) {
        if (err) return cb(err);
        ns.run(function () {
          self.setMagicValue('body', body);
          if (!self.body) self.addMagicGetter('body');
          cb(null, body);
        });
      }));
    };
  }, this);
};
