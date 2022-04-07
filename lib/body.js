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
      if (!cb) {
        if (typeof opts === 'function') {
          cb = opts;
          opts = {};
        } else {
          return new Promise((resolve, reject) => {
            const args = [(err, body) => {
              if (err) reject(err);
              else resolve(body);
            }];
            if (opts) {
              args.unshift(opts);
            }
            this[funcName](...args);
          });
        }
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
