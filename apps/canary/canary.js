

/**
 * Module dependencies.
 */

var express = require('express'),
    sio = require('socket.io'),
    memory = require('./memory.js')
    cpu = require('./cpu.js')

var app = express.createServer();


// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat" }));
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})


var io = sio.listen(app)

io.configure(function() {
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1); 
  io.set('transports', [
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ])
})

var socketClients = {},
    pushInterval = null



io.sockets.on('connection', function(socket) {
  
  if(!pushInterval) {
    pushInterval = setInterval(function() {
      var socketId, socket
      for(socektId in socketClients) {
        socket = socketClients[socektId]
        socket.emit('data', {
          memory: memory.getStats(),
          cpu: cpu.getStats()
        })
      }
    }, 500)
  }

  socketClients[socket.id] = socket

  socket.on('disconnect', function() {
    delete socketClients[socket.id]
    if(Object.keys(socketClients).length === 0) {
      clearInterval(pushInterval)
    }
  })

})

// Routes
app.get('/', function(req, res) {
  res.render('index')
})

module.exports = app