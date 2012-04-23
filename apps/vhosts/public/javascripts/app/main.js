
require([], function() {
  
  window.app = {}
    
  var Vhost = Backbone.Model.extend({
    init: function() {}
  })

  var Vhosts = Backbone.Collection.extend({
    url: '/vhost',
    model: Vhost
  })

})