var w = require('./index');
var assert = require('assert');

var app = w()
.get('/send', function(){
  w.send('hello');
})
.get('/this.send', function(){
  this.send("hello");
})
.get('/sendJson', function(){
  w.sendJson({hello: 'hello'});
})
.get('/sendHtml', function(){
  w.sendHtml('<b>Hello</b>');
})
.get('/sendError', function(){
  w.sendError(new Error('bad'));
})
.get('/test.js', function(){
  w.file(__dirname+'/test.js');
})
.get('/redirect', function(){
  w.redirect('/foo');
})
.post('/textBody', function(){
  w.textBody(function(err, body){
    w.send(body);
  });
})
.post('/jsonBody', function(){
  w.jsonBody(function(){
    w.sendJson(w.body);
  });
})
.post('/formBody', function(){
  w.formBody(function(){
    w.sendJson(w.body);
  });
})
.put('/puttest', function(){
  w.send(w.req.method);
})
.delete('/deletetest', function(){
  w.send(w.req.method);
})
.get('/thistest', function(){
  w.send(''+(w === this));
});

// ----

var request = require('request');
var root = 'http://localhost:3000/';

describe('whee!!', function(){
  beforeEach(function(done){
    app.listen(3000, done);
  });
  afterEach(function(done){
    app.server.close(done);
  });

  ['this.send', 'send'].forEach(function(test){
    it(test, function(done){
      request(root+test, function(err, res, body){
        assert.equal(body, 'hello');
        done();
      });
    });
  });

  it('sendJson', function(done){
    request(root+'sendJson', function(err, res, body){
      assert.deepEqual(JSON.parse(body), {"hello":"hello"});
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });

  it('sendHtml', function(done){
    request(root+'sendHtml', function(err, res, body){
      assert.equal(body, '<b>Hello</b>');
      assert.equal(res.headers['content-type'], 'text/html');
      done();
    });
  });

  it('sendError', function(done){
    request(root+'sendError', function(err, res, body){
      assert.deepEqual(JSON.parse(body), {"errors":[{"message":"bad","attribute":"general"}]});
      assert.equal(res.statusCode, 500);
      done();
    });
  });

  it('file', function(done){
    request(root+'test.js', function(err, res, body){
      assert.equal(res.headers['content-type'], 'application/javascript; charset=UTF-8');
      assert.equal(require('fs').readFileSync(__dirname+'/test.js', 'utf8'), body);
      done();
    });
  });

  it('redirect', function(done){
    request({url: root+'redirect', followRedirect: false}, function(err, res, body){
      assert.equal(res.headers.location, '/foo');
      assert.equal(res.statusCode, 302);
      done();
    });
  });

  it('textBody', function(done){
    request.post({url: root+'textBody', body: 'hello'}, function(err, res, body){
      assert.equal(body, 'hello');
      done();
    });
  });

  it('jsonBody', function(done){
    request.post({url: root+'jsonBody', json: {hello: 'hello'}}, function(err, res, body){
      assert.deepEqual(body, {"hello":"hello"});
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });

  it('formBody', function(done){
    request.post({url: root+'formBody', form: {hello: 'hello'}}, function(err, res, body){
      assert.deepEqual(JSON.parse(body), {"hello":"hello"});
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });

  it('puttest', function(done){
    request.put(root+'puttest', function(err, res, body){
      assert.equal(body, 'PUT');
      done();
    });
  });

  it('deletetest', function(done){
    request.del(root+'deletetest', function(err, res, body){
      assert.equal(body, 'DELETE');
      done();
    });
  });

  it('thistest', function(done){
    request(root+'thistest', function(err, res, body){
      assert.equal(body, 'true');
      done();
    });
  });

  it('404', function(done){
    request(root+'nonsense', function(err, res){
      assert.equal(res.statusCode, 404);
      done();
    });
  });
});
