
var os = require('os')

var cpu = {}

var lastCpus = null

cpu.getStats = function() {
  
  var stats, totals, cpusNow, cpus, cpu, type, time, i
  
  cpusNow = os.cpus()
  stats = {
    totals: {}
  }
  totals = {}

  cpus = []
  for (var i = cpusNow.length - 1; i >= 0; i--) {
    if(!cpus[i]) {
      cpus[i] = {
        times: {}
      }
    }
    for(type in cpusNow[i].times) {
      if(lastCpus) {
        cpus[i].times[type] = cpusNow[i].times[type] - lastCpus[i].times[type]
      }
      else {
        cpus[i].times[type] = cpusNow[i].times[type]
      }
    }
  }

  for (var i = cpus.length - 1; i >= 0; i--) {
    cpu = cpus[i]
    stats[i] = {
      total: 0
    }
    for(type in cpu.times) {
      time = cpu.times[type]
      if(!totals.total)
        totals.total = 0
      if(!totals[type])
        totals[type] = 0
      totals.total += time
      totals[type] += time
      stats[i].total += time
    }
    for(type in cpu.times) { 
      stats[i][type] = cpu.times[type] / (stats[i].total / 100)
    }
  }
  for(type in totals) {
    if(type !== 'total') {
      stats.totals[type] = totals[type] / (totals.total / 100)
    }
  }
  lastCpus = cpusNow
  return stats
}


module.exports = cpu