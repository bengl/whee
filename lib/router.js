const http = require('http');
const routes = require('routes');
const methods = require('methods');

function noop () {}

class Router {
  constructor (whee) {
    this.routesAndMethods = {};
    this.router = routes();
    this.whee = whee;
  }

  _process () {
    const { req } = this.whee.storage.getStore();
    const method = req.method.toUpperCase();
    const path = req.url;
    const routeObj = this.router.match(path);
    if (!routeObj) {
      return this.whee.send({ statusCode: 404 });
    }
    if (!this.routesAndMethods[path] || !this.routesAndMethods[path][method]) {
      return this.whee.send({ statusCode: 404 });
    }
    this.whee.setMagicValue('urlParams', routeObj.params);
    this.routesAndMethods[routeObj.route][method].call(this.whee);
  }

  listen () {
    this.server = http.createServer(this.handler());
    this.server.listen.apply(this.server, arguments);
  }

  handler () {
    return (req, res) => {
      this.whee.storage.run({ req }, () => {
        this.whee.setMagicValue('req', req);
        this.whee.setMagicValue('res', res);
        this.whee.setMagicValue('context', {});
        this._process();
      });
    };
  }
}

methods.forEach((method) => {
  Router.prototype[method.toLowerCase()] = function (path, cb) {
    if (!this.routesAndMethods[path]) {
      this.routesAndMethods[path] = {};
    }
    this.routesAndMethods[path][method.toUpperCase()] = cb;
    this.router.addRoute(path, noop);
    return this;
  };
});

module.exports = Router;
