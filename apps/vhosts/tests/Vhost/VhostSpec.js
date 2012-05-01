
var Vhost = require(__dirname + '/../../models/Vhost'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert')


function isDir(dirpath) {
  try {
    var stat = fs.lstatSync(dirpath)  
  } catch(e) {
    return false
  }
  if(stat && stat.isDirectory()) {
    return true
  }
  return false
}

function isFile(filepath) {
  try {
    var stat = fs.lstatSync(filepath)  
  } catch(e) {
    return false
  }  
  if(stat && stat.isFile()) {
    return true
  }
  return false
}




describe('Vhost', function() {

  //SETUP
  before(function() {

    process.env.NODE_ENV = "test"

    Vhost.configure('test', function() {
      this.set('vhostconfs', __dirname + '/vhostconfs')
      this.set('vhosts', __dirname + '/vhosts')
      this.set('apache', 'apachetl')
    })
  })

  //TESTS
  describe('Vhost.configure', function() {
    it('Should throw error on faulty conf and vhosts locations', function() {
      assert.throws(
        function() {
          Vhost.configure('test', function() {
            this.set('vhostconfs', __dirname + '/file')
          })
        },
        /isnt a directory/
      )
      assert.throws(
        function() {
          Vhost.configure('test', function() {
            this.set('vhosts', __dirname + '/file')
          })
        },
        /isnt a directory/
      )
      assert.throws(
        function() {
          Vhost.configure('test', function() {
            this.set('vhostconfs', __dirname + '/doesnotexist')
          })
        },
        /does not exits/
      )
      assert.throws(
        function() {
          Vhost.configure('test', function() {
            this.set('vhosts', __dirname + '/doesnotexist')
          })
        },
        /does not exits/
      )
    })
  })

  describe('Vhost.parseConf', function() {
    it('should return an object containing, ServerName, Directory and DocumentRoot', function() {
      var conf = fs.readFileSync(__dirname + "/vhostconfs/atbgt_wtw_no.conf", "utf8")
      var parsed = Vhost.parseConf(conf)
      assert.strictEqual(parsed.ServerName, 'atbgt.wtw.no')
      assert.strictEqual(parsed.Directory, '/var/www/vhosts/atbgt.wtw.no/www/frontend')
      assert.strictEqual(parsed.DocumentRoot, '/var/www/vhosts/atbgt.wtw.no/www/frontend')
    })
  })

  describe('Vhost.find', function() {
    it('should pass a new Vhost to the callback, with data from the config in vhost.data', function(done) {
      Vhost.find('atbgt.wtw.no', function(err, vhost) {
        assert.strictEqual(vhost.data.ServerName, 'atbgt.wtw.no')
        assert.strictEqual(vhost.data.Directory, '/var/www/vhosts/atbgt.wtw.no/www/frontend')
        assert.strictEqual(vhost.data.DocumentRoot, '/var/www/vhosts/atbgt.wtw.no/www/frontend')
        done()
      })
    })
    it('should receive an error to callback if the vhost does not exists', function(done) {
      Vhost.find('does.not.exist', function(err, vhost) {
        assert.ok(err)
        done()
      })
    })
  })

  describe('Vhost.all', function() {
    it('should pass an array of all the vhost at the given location specified in the config', function(done) {
      Vhost.all(function(err, vhosts) {
        assert.ok(vhosts)
        assert.ok(vhosts.length)
        assert.strictEqual(vhosts.length, 3)
        var i, vhost 
        for (i = 0; i < vhosts.length; i++) {
          vhost = vhosts[i]
          assert.ok(vhost instanceof Vhost)
        }
        done()
      })
    })
  })

  describe('Vhost.prototype.save', function() {
    it('should create a new conf file and a vhost directory if it is a new vhost', function(done) {
      var vhost = new Vhost({
        ServerName: 'test.wtw.no'
      })
      vhost.save(function(err, vhost) {
        assert.ok(isFile(__dirname + "/vhostconfs/test_wtw_no.conf"))
        assert.ok(isDir(__dirname + "/vhosts/test.wtw.no"))
        assert.ok(vhost instanceof Vhost)
        assert.strictEqual(vhost.get('ServerName'), 'test.wtw.no')
        assert.strictEqual(vhost.get('DocumentRoot'), Vhost.config.vhosts + '/test.wtw.no')
        assert.strictEqual(vhost.get('Directory'), Vhost.config.vhosts + '/test.wtw.no')
        done()
      })
    })
    it('should update the conf file for existing vhosts', function(done) {
      var vhost = new Vhost({
        ServerName: 'new.wtw.no',
        Directory: __dirname + '/vhosts/new.wtw.no'
      })
      vhost.save(function(err, vhost) {
        assert.ok(isFile(__dirname + "/vhostconfs/new_wtw_no.conf"))
        assert.ok(isDir(__dirname + "/vhosts/new.wtw.no"))
        assert.ok(vhost instanceof Vhost)
        assert.strictEqual(vhost.get('ServerName'), 'new.wtw.no')
        assert.strictEqual(vhost.get('Directory'), __dirname + '/vhosts/new.wtw.no')
        done()
      })
    })
    it('should receive an error if it could not create a directory at the specified Directory path', function() {
      //!TODO!
    })
    it('should receive an error if the ServerName is in use by another vhost', function() {
      //!TODO!
    })
  })


  //TEARDOWN
  after(function(done) {
    fs.unlinkSync(__dirname + "/vhostconfs/test_wtw_no.conf")
    fs.unlinkSync(__dirname + "/vhostconfs/new_wtw_no.conf")
    fs.rmdirSync(__dirname + "/vhosts/test.wtw.no")
    fs.rmdirSync(__dirname + "/vhosts/new.wtw.no")
    done()
  })
})





















