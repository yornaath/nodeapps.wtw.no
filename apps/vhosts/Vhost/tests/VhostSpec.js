
var Vhost = require(__dirname + '/../Vhost.js')


describe('Vhost', function() {

  var vhost

  beforeEach(function() {
    Vhost.configure('test', function() {
      this.set('vhostconfs', __dirname + '/vhostconfs')
      this.set('vhosts', __dirname + '/vhosts')
      this.set('apache', 'apachetl')
    })
    vhost = new Vhost()
  })

  describe('Vhost.configure', function() {
    it('Should throw error on faulty conf and vhosts locations', function() {
      expect(function() {
        Vhost.configure('test', function() {
          this.set('vhostconfs', __dirname + '/file')
        })
      }).toThrow(new Error('The folder: supplied for vhostconfs isnt a directory'))
      expect(function() {
        Vhost.configure('test', function() {
          this.set('vhosts', __dirname + '/file')
        })
      }).toThrow(new Error('The folder: supplied for vhosts isnt a directory'))
      expect(function() {
        Vhost.configure('test', function() {
          this.set('vhostconfs', __dirname + '/doesnotexist')
        })
      }).toThrow(new Error('The folder: supplied for vhostconfs does not exits'))
      expect(function() {
        Vhost.configure('test', function() {
          this.set('vhosts', __dirname + '/doesnotexist')
        })
      }).toThrow(new Error('The folder: supplied for vhosts does not exits'))
    })
  })

  describe('Vhost.prototype.save', function() {
  })

  describe('Vhost.all', function() {
    it('',function() {
      Vhost.all(function(err, vhosts) {
        console.log(vhosts);
      })
    })
  })

})