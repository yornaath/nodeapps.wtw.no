
/**
 * Module dependencies.
 */

var express = require('express')

var server = module.exports = express.createServer();

// Configuration

var apps = {}

server.configure(function(){
  server.set('views', __dirname + '/views')
  server.set('view engine', 'jade')
  server.use(express.bodyParser())
  server.use(express.methodOverride())
  server.use(server.router)
});

server.configure('development', function(){
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
});

server.configure('production', function(){
  server.use(express.errorHandler())
});

// Routes

server.all(/\/.*/, function(req, res, next) {
  var app,
      subdomain
  
  app = null
  subdomain = (/(.*)\..*\..*/).exec(req.headers['x-forwarded-host'])[1]
  if(!apps[subdomain]) {
    apps[subdomain] = require('./apps/'+subdomain) || null
  }
  app = apps[subdomain]
  if(app) {
    app.emit('request', req, res)
  }
  else {
    res.redirect('/404')
  }
})

server.listen(3000);
console.log("Express server listening on port %d in %s mode", server.address().port, server.settings.env)
