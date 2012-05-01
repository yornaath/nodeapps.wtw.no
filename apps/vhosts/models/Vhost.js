
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

function isDirAsync(dirpath, cb) {
  var stat = fs.lstat(dirpath, function(err, stat) {
    if(err) {
      return cb(err, false)
    }
    if(stat && stat.isDirectory()) {
      return cb(null, true)
    }
    return cb(null, false)
  })
}


function isFile(filepath) {
  var stat = fs.lstatSync(filepath)
  if(stat && stat.isFile()) {
    return true
  }
  return false
}

function isFileAsync(dirpath, cb) {
  var stat = fs.lstat(dirpath, function(err, stat) {
    if(err) {
      return cb(err, false)
    }
    if(stat && stat.isFile()) {
      return cb(null, true)
    }
    return cb(null, false)
  })
}

var Vhost = (function(){
  
  function Vhost(data){
    var key
    this.data = {}
    for(key in data) {
      this.set(key, data[key])
    }
  }
  
  Vhost.prototype = new EventEmitter()

  Vhost.confTemplate = fs.readFileSync(__dirname + "/vhost.conf.template", "utf8")

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
            throw new Error('The folder path supplied for vhostconfs isnt a directory')  
          } else {
            throw new Error('The folder path supplied for vhostconfs does not exits')  
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
            throw new Error('The folder path supplied for vhosts isnt a directory')  
          } else {
            throw new Error('The folder path supplied for vhosts does not exits')  
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
  
  Vhost.serverNameToFilePath = function(serverName) {
    var filePath = Vhost.config.vhostconfs + "/" + serverName.replace(/\./g, '_') + '.conf'
    return filePath
  }

  Vhost.find = function(serverName, cb) {
    var filePath = Vhost.serverNameToFilePath(serverName)
    isFileAsync(filePath, function(err, isFile) {
      if(err) {
        return cb(err)
      }
      if(!isFile) {
        return cb(new Error('serverName' + ' does not exist'), null) 
      }
      fs.readFile(filePath, 'utf8', function(err, conf) {
        if(err) {
          return cb(err)
        }
        var vhost = new Vhost(Vhost.parseConf(conf)) 
        cb(null, vhost)
      })
    })
  }

  Vhost.all = function(cb) {
    fs.readdir(Vhost.config.vhostconfs, function(err, filenames) {
      if(err) {
        return cb(err)
      }
      var vhosts = []
      function walkFiles(filename) {
        if(filename) {
          if(!(/\.conf/.test(filename))) {
            return walkFiles(filenames.shift())
          }
          fs.readFile(Vhost.config.vhostconfs + '/' + filename, 'utf8', function(err, conf) {
            if(err) {
              //TODO: how to properly handle this
            } else if(conf) {
              vhosts.push(new Vhost(Vhost.parseConf(conf)))
            }
            return walkFiles(filenames.shift())      
          })    
        } else {
          return cb(null, vhosts)
        }
      }
      walkFiles(filenames.shift())
    })
  }

  Vhost.parseConf = function(conf) {
    var parsed, regex, val
    parsed = {}
    parsed.configdata = conf
    for(regex in Vhost.regex) {
      val = ((Vhost.regex[regex].exec(conf || "") || [])[1]) || ""
      parsed[regex] = val
    }
    return parsed
  }

  Vhost.prototype.set = function(key, val) {
    if(!val) {
      throw new Error('No value specifed to Vhost.prototype.set')
    }
    if(key === 'ServerName') {
      if(!this.get('Directory')) {
        this.set('Directory', Vhost.config.vhosts + '/' + val) 
      }
      if(!this.get('DocumentRoot')) {
        this.set('DocumentRoot', Vhost.config.vhosts + '/' + val)  
      }
    }
    this.data[key] = val
  }

  Vhost.prototype.get = function(key) {
    return this.data[key]
  }

  Vhost.prototype.generateConfFromTemplate = function() {
    var attrs = {
      ServerName: this.get('ServerName'),
      DocumentRoot: this.get('DocumentRoot'),
      Directory: this.get('Directory') 
    }
    if(!attrs.DocumentRoot) {
      attrs.DocumentRoot = Vhost.config.vhosts + "/" + this.get('ServerName')
    }
    if(!attrs.Directory) {
      attrs.Directory = Vhost.config.vhosts + "/" + this.get('ServerName') 
    }
    var conf = Vhost.confTemplate
    for(var attr in attrs) {
      conf = conf.replace('*'+attr+'*', attrs[attr])
    }
    return conf
  }

  Vhost.prototype.save = function(cb) {
    var self = this,
        conf = this.generateConfFromTemplate()
    fs.writeFile(Vhost.serverNameToFilePath(self.get('ServerName')), conf, 'utf8', function(err) {
      if(err) {
        return cb(err)
      }
      isDirAsync(self.get('Directory'), function(err, vhostDirExists) {
        if(!vhostDirExists) {
          fs.mkdir(self.get('Directory'), function(err) {
            if(err) {
              return cb(err)
            }
            cb(null, new Vhost(Vhost.parseConf(conf)))    
          })
        } else {
          cb(null, new Vhost(Vhost.parseConf(conf))) 
        }
      })
    })
  }

  Vhost.prototype.toJSON = function() {
    return this.data
  }

  return Vhost
})()

module.exports = Vhost





