const http = require('http');
const router = require('router');
const methods = require('methods');
const finalHandler = require('finalhandler');

class Router {
  constructor (whee) {
    this.router = router();
    this.whee = whee;
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
      this.whee.storage.run({ req }, () => {
        this.whee.setMagicValue('req', req);
        this.whee.setMagicValue('res', res);
        this.whee.setMagicValue('context', {});
        this.whee.setMagicValue('urlParams', req.params);
        cb.call(this.whee);
      });
    });
    return this;
  };
});

module.exports = Router;
