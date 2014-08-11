# WHEE!!

**Whee** is a very simple framework/router/thing for node that emphasizes *magic*. Things just work, even though they probably shouldn't. Some batteries included.

> **WARNING:** This is more of a whimsical little experiment than a production-ready web framework. Seriously, I made most of this on a plane on very little sleep. If you want something more battle-tested and realistic (and you should), check out [express](https://www.npmjs.org/package/express), [restify](https://www.npmjs.org/package/restify) or [hapi](https://www.npmjs.org/package/hap://www.npmjs.org/package/hapi).

## Installation

`# npm i --save whee`

## Usage

First of all, require it:

```javascript
var w = require('whee')
```

And now, here's a Hello World:

```javascript
w()
.get('/', function(){
  w.send('Hello, World!')
})
.listen(3000);
```

Go ahead and try it! It's that simple! Whee!

You can also do all your other favorite HTTP verbs, like `post`, `put` and `delete`.

The `w` object is also your `this` object, so you can call it that way, which is sometimes handy. Especially for CoffeeScript people.

```javascript
//JavaScript

w()
.get('/', function() {
  this.send('Hello, World!')
})
.listen(3000)
```

```coffeescript
//CoffeeScript

w()
.get '/', -> @send 'Hello, World!'
.listen 3000
```

You have access to `send`, `sendJson`, `sendHtml` and `sendError` on the `w` object, which are all pass-throughs to [send-data](https://www.npmjs.org/package/send-data).

```javascript
w()
.get('/', function(){
  w.sendHtml('<b>Hello!</b>')
})
.listen(3000)
```

You have access to `textBody', `jsonBody`, `formBody` and `anyBody` on the `w` object, which are all pass-throughs to [body](https://www.npmjs.org/package/body). Instead of being passed in to the callback, the parsed body is then attached at `w.body`.

```javascript
w()
.post('/jsonEcho', function(){
  w.jsonBody(function(err){
    w.sendJson(w.body)
  })
})
```

Heresy? Yup, probably. Too bad.

There's also some basic redirect and static file stuff built in, but I'm a lazy README author so you can find those in the tests.

## Magic Revealed

This magic comes from hiding the necessary bits (like your `req` and `res` objects that you're used to) away in [continuation local storage](https://www.npmjs.org/package/continuation-local-storage). Go read up on it. You'll love it! Also, it explains this stuff way better than I do. 

Basically it lets you keep a context around for as long as your continuation chain lasts. For our purposes, that means the length of an HTTP request and response cycle. This is great news because we can hide stuff away in there!

Don't worry, `req` and `res` aren't gone forever. There's accessible at `w.req` and `w.res`, so long as you're inside a handler.

If you want to hide your own stuff in there, you've got a few options:

#### The Direct Way

Grab the `whee` namespace from `cls` and interact with it directly:

```javascript
var ns = require('continuation-local-storage')
         .getNamespace('whee');

// then, somewhere in a request handler ...
ns.set('mysessionthing', {some: 'thing'});

// ....

var session = ns.get('mysessionthing');
```

You can also use your own namespace.

#### The Magic Way

This sets up accessors on the `w` object:

```javascript
var w = require('whee');

w.addMagicGetter('mysessionthing');

// then, somewhere in a request handler ...
w.setMagicValue('mysessionthing', {some: 'thing'});

// ....

var session = w.mysessionthing;
```

This is how the builtins are added!

#### The Easy Way

A `context` object is provided for you on `w` so you can just put stuff there:

```javascript
// somewhere in a request handler ...
w.context.mysessionthing = {some: 'thing'};

// ...

var session = w.context.mysessionthing;
```

With each of these, remember that this stuff carries over to your next continuation, and so on, until you're done dealing with that request.

## Compatibility

What about your connect/express middleware? Well we wouldn't want to leave that giant mountain of code behind. Luckily there's a pretty cool function called `wrap` that we can use. It takes a function that would ordinarily take in a request and response object, and returns a function that has those arguments already prepended via **whee**'s magic.

```javascript
var w = require('whee');
var morgan = w.wrap(require('morgan'));
// morgan is a pretty good logging middleware

w()
.get('/', function(){
  morgan(function(){
    w.send('Hello, World!');
  });
});
```

Yes, for now, you'll have to call your middlewares directly. But being deliberate like this is half the fun right? Wheeeeeee!!!

## LICENSE

See LICENSE file.
