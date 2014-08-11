var filed = require('filed');

module.exports = function(){
  this.file = this.wrap(function(req, res, filename){
    filed(filename).pipe(res);
  });
};
