const cls = require('continuation-local-storage');
const ns = cls.getNamespace(require('../package').name);
const http = require('http');
const routes = require('routes');
const methods = require('methods');

function noop () {}

function Router (whee) {
  this.routesAndMethods = {};
  this.router = routes();
  this.whee = whee;
}

methods.forEach(function (method) {
  Router.prototype[method.toLowerCase()] = function (path, cb) {
    if (!this.routesAndMethods[path]) {
      this.routesAndMethods[path] = {};
    }
    this.routesAndMethods[path][method.toUpperCase()] = cb;
    this.router.addRoute(path, noop);
    return this;
  };
});

Router.prototype._process = function () {
  const req = ns.get('req');
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
};

Router.prototype.listen = function () {
  this.server = http.createServer(this.handler());
  this.server.listen.apply(this.server, arguments);
};

Router.prototype.handler = function () {
  const self = this;
  return function (req, res) {
    ns.run(function () {
      self.whee.setMagicValue('req', req);
      self.whee.setMagicValue('res', res);
      self.whee.setMagicValue('context', {});
      self._process();
    });
  };
};

module.exports = Router;
