

var express = require('express'),
    apploader = require('./apps')


var server = module.exports = express.createServer()

server.configure(function(){
  server.set('views', __dirname + '/views')
  server.set('view engine', 'jade')
  server.use(express.bodyParser())
  server.use(express.methodOverride())
  server.use(server.router)
})

server.configure('development', function(){
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

server.configure('production', function(){
  server.use(express.errorHandler())
})

// Routes

server.all(/\/.*/, function(req, res, next) {
  var subdomain = (/(.*)\..*\..*/).exec(req.headers['x-forwarded-host'])[1]
  apploader.load(subdomain, function(err, app) {
    if(err || !app) {
      res.redirect('/404')  
    } else {
      app.emit('request', req, res)
    }
  })

})

server.listen(3000)
console.log("nodeapps.wtw.no server listening on port %d in %s mode", server.address().port, server.settings.env)
