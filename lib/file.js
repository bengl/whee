const send = require('send');

module.exports = function () {
  this.file = this.wrap((req, res, filename) => {
    send(req, filename).pipe(res);
  });
};
