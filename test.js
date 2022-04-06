/* eslint-env mocha */
const w = require('./index');
const assert = require('assert');
const path = require('path');

const app = w()
  .get('/send', () => {
    w.send('hello');
  })
  .get('/this.send', function () {
    this.send('hello');
  })
  .get('/sendJson', () => {
    w.sendJson({ hello: 'hello' });
  })
  .get('/sendHtml', () => {
    w.sendHtml('<b>Hello</b>');
  })
  .get('/sendError', () => {
    w.sendError({ body: new Error('bad') });
  })
  .get('/test.js', () => {
    w.file(path.join(__dirname, 'test.js'));
  })
  .get('/redirect', () => {
    w.redirect('/foo');
  })
  .post('/textBody', () => {
    w.textBody(function (_err, body) {
      w.send(body);
    });
  })
  .post('/jsonBody', () => {
    w.jsonBody(() => {
      w.sendJson(w.body);
    });
  })
  .post('/formBody', () => {
    w.formBody(() => {
      w.sendJson(w.body);
    });
  })
  .put('/puttest', () => {
    w.send(w.req.method);
  })
  .delete('/deletetest', () => {
    w.send(w.req.method);
  })
  .get('/thistest', function () {
    w.send('' + (w === this));
  });

// ----

const request = require('request');
const root = 'http://localhost:3000/';

describe('whee!!', () => {
  beforeEach(done => {
    app.listen(3000, done);
  });
  afterEach(done => {
    app.server.close(done);
  });

  ['this.send', 'send'].forEach((test) => {
    it(test, done => {
      request(root + test, (_err, res, body) => {
        assert.equal(body, 'hello');
        done();
      });
    });
  });

  it('sendJson', done => {
    request(root + 'sendJson', (_err, res, body) => {
      assert.deepEqual(JSON.parse(body), { hello: 'hello' });
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });

  it('sendHtml', done => {
    request(root + 'sendHtml', (_err, res, body) => {
      assert.equal(body, '<b>Hello</b>');
      assert.equal(res.headers['content-type'], 'text/html');
      done();
    });
  });

  it('sendError', done => {
    request(root + 'sendError', (_err, res, body) => {
      assert.deepEqual(JSON.parse(body), {
        message: 'bad',
        statusCode: 500
      });
      assert.equal(res.statusCode, 500);
      done();
    });
  });

  it('file', done => {
    request(root + 'test.js', (_err, res, body) => {
      assert.equal(res.headers['content-type'], 'application/javascript; charset=UTF-8');
      assert.equal(require('fs').readFileSync(path.join(__dirname, 'test.js'), 'utf8'), body);
      done();
    });
  });

  it('redirect', done => {
    request({ url: root + 'redirect', followRedirect: false }, (_err, res, body) => {
      assert.equal(res.headers.location, '/foo');
      assert.equal(res.statusCode, 302);
      done();
    });
  });

  it('textBody', done => {
    request.post({ url: root + 'textBody', body: 'hello' }, (_err, res, body) => {
      assert.equal(body, 'hello');
      done();
    });
  });

  it('jsonBody', done => {
    request.post({ url: root + 'jsonBody', json: { hello: 'hello' } }, (_err, res, body) => {
      assert.deepEqual(body, { hello: 'hello' });
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });

  it('formBody', done => {
    request.post({ url: root + 'formBody', form: { hello: 'hello' } }, (_err, res, body) => {
      assert.deepEqual(JSON.parse(body), { hello: 'hello' });
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });

  it('puttest', done => {
    request.put(root + 'puttest', (_err, res, body) => {
      assert.equal(body, 'PUT');
      done();
    });
  });

  it('deletetest', done => {
    request.del(root + 'deletetest', (_err, res, body) => {
      assert.equal(body, 'DELETE');
      done();
    });
  });

  it('thistest', done => {
    request(root + 'thistest', (_err, res, body) => {
      assert.equal(body, 'true');
      done();
    });
  });

  it('404', done => {
    request(root + 'nonsense', (_err, res) => {
      assert.equal(res.statusCode, 404);
      done();
    });
  });
});
