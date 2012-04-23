
var Vhost = require(__dirname + "/../Vhost")

Vhost.configure('development', function() {
  this.set('vhostconfs', __dirname + '/../mockdata/vhostconfs')
  this.set('vhosts', __dirname + '/../mockdata/vhosts')
  this.set('apache', 'apachetl')
})

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index')
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