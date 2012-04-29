
require.config({
  baseUrl: 'javascripts'
})

require([], function() {
  
  var Vhost = Backbone.Model.extend({
    regexs: {
      'DocumentRoot': /DocumentRoot\s*(.*)\n/,
      'ServerName': /ServerName\s*(.*)\n/,
      'Directory': /\<Directory\s*(.*)\>/
    },
    initialize: function() {
      this.on('change:configdata', function(event, configdata) {
        for(var regex in this.regexs) {
          this.set(regex, (this.regexs[regex].exec(configdata) || [])[1] )
        }
      }.bind(this))
      this.on('change:DocumentRoot', function(opts, newval) {
        this.parseInputToConfig("DocumentRoot", newval)
      }.bind(this))
      this.on('change:Directory', function(opts, newval) {
        this.parseInputToConfig("Directory", newval)
      }.bind(this))
      this.on('change:ServerName', function(opts, newval) {
        this.parseInputToConfig("DocumentRoot", newval)
      }.bind(this))
    },
    parseInputToConfig: function(attribute, value) {
      var configdata = this.get('configdata'),
          pattern = this.regexs[attribute].exec(configdata),
          toReplace = pattern[0],
          replaceWith = pattern[0].replace(pattern[1], value)
      this.set('configdata', configdata.replace(toReplace, replaceWith), {
        silent: true
      })
    }
  })

  var VhostsCollection = Backbone.Collection.extend({
    url: '/vhost',
    model: Vhost
  })

  var VhostView = Backbone.View.extend({
    tagName: 'li',
    className: 'vhost row',
    template: $('#vhost-template').html(),
    events: {
      'blur input': 'edited',
      'blur textarea': 'edited'
    },
    initialize: function() {
      this.model.on('change', function() {
        this.render() 
      }.bind(this))
    },
    edited: function(e) {
      var input = $(e.currentTarget)
      this.model.set(input.attr('data-attribute'), input.val())
    },
    render: function() {
      this.$el.html(_.template(this.template, {
        vhost: this.model
      }))
      return this
    }
  })

  var VhostListView = Backbone.View.extend({
    tagName: 'ul',
    id: 'vhosts',
    className: 'unstyled',
    render: function() {
      this.collection.each(function(vhost) {
        var view = new VhostView({
          model: vhost
        })
        this.$el.append(view.render().el)
      }.bind(this))
      return this
    }
  })

  var App = Backbone.View.extend({
    el: '#main.container',
    initialize: function(options) {
      _.extend(this, options)
      this.vhostsCollection.reset(boostrapdata.vhosts)
      this.render()
    },
    render: function() {
      var vhostListView = new VhostListView({
        collection: this.vhostsCollection
      })
      this.$el.append(vhostListView.render().$el)
      return this
    }
  })

  window.app = new App({
    vhostsCollection: new VhostsCollection()
  })

})