

var socket = io.connect()
socket.on('data', function(data) {
  console.log('idle', data.cpu.totals['idle'] + '%');
})



$(document).ready(function() {
  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  var chart

  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'memorystats',
      type: 'spline',
      marginRight: 10,
      events: {
        load: function() {
          // set up the updating of the chart each second
          var series = this.series[0];
          var timestamp = (new Date()).getTime()
          series.addPoint([timestamp, parseFloat(memory.usage)], true, true);
        }
      }
    },
    title: {
      text: 'Memory usage in %'
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150
    },
    yAxis: {
      title: {
        text: 'Usage %'
      },
      min: 0,
      max: 100,
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080',
        label: {
          
        }
      }],
      minorTickInterval: 5,
      tickInterval: 5
    },
    tooltip: {
      formatter: function() {
          return '<b>'+ this.series.name +'</b><br/>'+
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
          Highcharts.numberFormat(this.y, 2);
      }
    },
    legend: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: 'Random data'
    }]
  });

});

