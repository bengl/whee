module.exports = function () {
  this.send = this.wrap(require('send-data'));
  this.sendJson = this.wrap(require('send-data/json'));
  this.sendHtml = this.wrap(require('send-data/html'));
  this.sendError = this.wrap(require('send-data/error'));
};
