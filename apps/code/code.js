

/**
 * Module dependencies.
 */

var express = require('express'),
    sharejs = require('share').server

var app = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
});

app.configure('production', function(){
  app.use(express.errorHandler())
});

sharejs.attach(app, {
  db: {
    type: 'none'
  },
  socketio: {
    transports: [
      'xhr-polling'
    ] 
  }
})

// Routes
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' })
})

module.exports = app