
var EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    path = require('path')


function isDir(dirpath) {
  var stat = fs.lstatSync(dirpath)
  if(stat && stat.isDirectory()) {
    return true
  }
  return false
}

function isFile(filepath) {
  var stat = fs.lstatSync(filepath)
  if(stat && stat.isFile()) {
    return true
  }
  return false
}

var Vhost = (function(){
  
  function Vhost(data){
    this.data = data || {}
    this.parseConfig()
  }
  
  Vhost.prototype = new EventEmitter()

  Vhost.regex = {
    'DocumentRoot': /DocumentRoot\s*(.*)\n/,
    'ServerName': /ServerName\s*(.*)\n/,
    'Directory': /\<Directory\s*(.*)\>/
  }

  Vhost.config = Object.create({ },(function() {
    var vhostconfs = null
    var vhosts = null
    var apache = null
    return {
      'vhostconfs': {
        get: function() { return vhostconfs },
        set: function(value) {
          if(path.existsSync(value)) {
            if(isDir(value)) {
              return vhostconfs = value
            }
            throw new Error('The folder: supplied for vhostconfs isnt a directory')  
          } else {
            throw new Error('The folder: supplied for vhostconfs does not exits')  
          }
        }
      },
      'vhosts': {
        get: function() { return vhosts },
        set: function(value) {
          if(path.existsSync(value)) {
            if(isDir(value)) {
              return vhosts = value
            }
            throw new Error('The folder: supplied for vhosts isnt a directory')  
          } else {
            throw new Error('The folder: supplied for vhosts does not exits')  
          }
        }
      },
      'apache': {
        get: function() { return apache },
        set: function(value) {
          apache = value
        }
      },
    }
  }).call(Vhost))

  Vhost.configure = function(env, confn) {
    var currenv = process.env.NODE_ENV || 'development'
    if(env === currenv) {
      if(typeof confn === 'function') {
        confn.call({
          set: function(key, val) {
            Vhost.config[key] = val
          }
        })
      } else {
        throw new Error('Vhost.configure not called with configurment function typeof function')
      }
    }
  }
  
  Vhost.find = function(configpath, cb) {
    fs.readFile(configpath, 'utf8', function(err, configdata) {
      if(err) {
        return cb(err)
      }
      var vhost = new Vhost({
        configpath: configpath,
        configdata: configdata
      })
      cb(null, vhost)
    })
  }

  Vhost.all = function(cb) {
    fs.readdir(Vhost.config.vhostconfs, function(err, filenames) {
      if(err) {
        return cb(err)
      }
      var vhosts = []
      function walkFiles(filename){
        if(filename) {
          Vhost.find(Vhost.config.vhostconfs + "/" + filename, function(err, vhost) {
            if(err) {
              return cb(err)
            }
            vhosts.push(vhost)
            walkFiles(filenames.shift()) 
          })
        } else {
          cb(null, vhosts)
        }
      }
      walkFiles(filenames.shift())
    })
  }

  Vhost.prototype.save = function(cb) {
    
  }

  Vhost.prototype.parseConfig = function() {
    for(var regex in Vhost.regex) {
      this.set(regex, (Vhost.regex[regex].exec(this.get('configdata') || "") || [])[1])
    }
  }

  Vhost.prototype.set = function(key, val) {
    this.data[key] = val
  }

  Vhost.prototype.get = function(key) {
    return this.data[key]
  }

  Vhost.prototype.toJSON = function() {
    return this.data
  }

  return Vhost
})()

module.exports = Vhost





