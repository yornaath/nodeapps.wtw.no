
var os = require('os')

var memory = {}

memory.freeMem = function(format) {
  var val = format === 'mb' ? (os.freemem() / 1048576) :
            format === 'gb' ? (os.freemem() / (1048576 * 1000)) :
                              0
  return val.toFixed(2)
}

memory.totalMem = function(format) {
  var val = format === 'mb' ? (os.totalmem() / 1048576) :
            format === 'gb' ? (os.totalmem() / (1048576 * 1000)) :
                              0
  return val.toFixed(2)
}

memory.usage = function(format) {
  var val = format === '%' ? (os.totalmem() - os.freemem()) / (os.totalmem() / 100) :
                              0
  return val.toFixed(2)
}

memory.getStats = function() {
  return {
    free: this.freeMem('mb'),
    total: this.totalMem('mb'),
    usage: this.usage('%')
  }
}


module.exports = memory