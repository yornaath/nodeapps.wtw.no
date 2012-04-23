

var apps = {}

function load(subdomain, cb) {
  if(!apps[subdomain]) {
    try {
      var app = require(__dirname + "/" + subdomain) 
    } catch(e) {
      
    }
    if(app) {
      apps[subdomain] = app
      cb(null, app)
    } else {
      cb('404')
    }
  } else {
    cb(null, apps[subdomain])
  }
}

module.exports = {
  load: load
}