const bodies = {
  textBody: require('body'),
  jsonBody: require('body/json'),
  formBody: require('body/form'),
  anyBody: require('body/any')
};

module.exports = function () {
  Object.keys(bodies).forEach((funcName) => {
    const wrapped = this.wrap(bodies[funcName]);
    this[funcName] = function (opts, cb) {
      if (!cb && typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      const store = this.storage.getStore();
      return wrapped(opts, (err, body) => {
        this.storage.run(store, () => {
          if (err) return cb(err);
          this.setMagicValue('body', body);
          if (!this.body) this.addMagicGetter('body');
          cb(null, body);
        });
      });
    };
  });
};
