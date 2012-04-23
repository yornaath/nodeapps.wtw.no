
require.config({
  baseUrl: 'javascripts'
})

require([], function() {
  
  var Vhost = Backbone.Model.extend({
    
  })

  var VhostsCollection = Backbone.Collection.extend({
    url: '/vhost',
    model: Vhost
  })

  var VhostView = Backbone.View.extend({
    tagName: 'li',
    class: 'vhost',
    template: $('#vhost-template').html(),
    render: function() {
      this.$el.html(_.template(this.template, {
        vhost: this.model
      }))
      return this
    }
  })

  var VhostListView = Backbone.View.extend({
    id: 'vhosts',
    el: 'ul',
    render: function() {
      this.collection.each(function(vhost) {
        var view = new VhostView({
          model: vhost
        })
        this.$el.append(view.render().el)
      }.bind(this))
    }
  })

  var App = Backbone.View.extend({
    el: 'body',
    initialize: function(options) {
      _.extend(this, options)
      this.vhostsCollection.reset(boostrapdata.vhosts)
      this.render()
    },
    render: function() {
      var vhostListView = new VhostListView({
        collection: this.vhostsCollection
      })
      vhostListView.render()
      return this
    }
  })

  window.app = new App({
    vhostsCollection: new VhostsCollection()
  })

})