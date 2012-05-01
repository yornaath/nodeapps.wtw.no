
var Vhost = require(__dirname + "/../Models/Vhost")

Vhost.configure('development', function() {
  this.set('vhostconfs', __dirname + '/../mockdata/vhostconfs')
  this.set('vhosts', __dirname + '/../mockdata/vhosts')
  this.set('apache', 'apachetl')
})


exports.views = {
  index: function(req, res){
    Vhost.all(function(err, vhosts) {
      res.render('index', {
        vhosts: JSON.stringify(vhosts)
      })
    })
  }
}

exports.api = {
  vhost: {
    all: function(req, res) {
      Vhost.all(function(err, vhosts) {
        res.send(vhosts)
      })
    }
  }
}