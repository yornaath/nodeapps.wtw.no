
require.config({
  baseUrl: 'javascripts'
})

require([], function() {
  
  window.Vhost = Backbone.Model.extend({
    idAttribute: 'ServerName',
    url: '/vhost',
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
        this.parseInputToConfig("ServerName", newval)
      }.bind(this))
    },
    parseInputToConfig: function(attribute, value) {
      var configdata = this.get('configdata'),
          pattern = this.regexs[attribute].exec(configdata),
          toReplace = pattern[0],
          replaceWith = pattern[0].replace(pattern[1], value)
      this.set('configdata', configdata.replace(toReplace, replaceWith))
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
      'focus input': 'editing',
      'keyup input': 'valuechange',
      'blur input': 'edited',
      'blur textarea': 'edited'
    },
    initialize: function() {
      this.model.on('change:ServerName', this.onModelChange.bind(this, 'ServerName'))
      this.model.on('change:DocumentRoot', this.onModelChange.bind(this, 'DocumentRoot'))
      this.model.on('change:Directory', this.onModelChange.bind(this, 'Directory'))
      this.model.on('change:configdata', this.onModelChange.bind(this, 'configdata'))
    },
    onModelChange: function(attribute) {
      this.$el.find('[data-attribute="' + attribute + '"]')
        .val(this.model.get(attribute))
      this.setLabel('Changed', 'warning')
      setTimeout(function() {
        this.removeBadge(attribute)
      }.bind(this), 500)
    },
    editing: function(e) {
      var input = $(e.currentTarget),
          attribute = input.attr('data-attribute')
    },
    valuechange: function(e) {
      var input = $(e.currentTarget),
          attribute = input.attr('data-attribute')
      this.model.set(attribute, input.val(), { silent: true })
      this.$el.find("submit.save.btn")
        .removeClass('disabled')
      if(attribute === 'DocumentRoot' || 'Directory') {
        this.popBadge('configdata', '...', 'info')
      }
    },
    edited: function(e) {
      var input = $(e.currentTarget),
          attribute = input.attr('data-attribute')
      this.model.set(attribute, input.val())
    },
    render: function() {
      this.$el.html(_.template(this.template, {
        vhost: this.model
      }))
      if(this.model.isNew()) {
        this.setLabel('New', 'info')
      } else {
        this.setLabel('Saved', 'success')
      }
      return this
    },
    popBadge: function(attribute, msg, className) {
      var badge = this.$el.find('.' + attribute + ' .badge'),
          className = 'badge-'+className
      badge
        .text(msg)
        .attr('class', 'badge')
        .addClass(className)
        .fadeIn(200)
    },
    removeBadge: function(attribute) {
      var badge = this.$el.find('.' + attribute + ' .badge'),
          className = 'badge-'+className
      badge
        .attr('class', 'badge')
        .fadeOut(150)
    },
    setLabel: function(msg, className) {
      console.log(this.$el.find('h2 .label'));
      this.$el.find('h2 .label')
        .attr('class', 'label')
        .addClass('label-' + className)
        .text(msg)
    }
  })

  var VhostListView = Backbone.View.extend({
    tagName: 'ul',
    id: 'vhosts',
    className: 'unstyled',
    events: {
      'click li h2': 'selectItem'
    },
    initialize: function() {
      this.collection.on('add', function() {
        this.render()
      }.bind(this))
      this.collection.on('remove', function() {
        this.render()
      }.bind(this))
    },
    render: function(collection) {
      console.log(arguments);
      var collection = collection || this.collection
      this.$el.empty()
      collection.each(function(vhost) {
        var view = new VhostView({
          model: vhost
        })
        this.$el.append(view.render().el)
      }.bind(this))
      return this
    },
    selectItem: function(e) {
      this.$el.find('li')
        .removeClass('active')
        .removeClass('above-active')
        .removeClass('under-active')
      var li = $(e.currentTarget).parent()
      li.addClass('active')
      li.prev().addClass('above-active')
      li.next().addClass('under-active')
    }
  })

  var VhostCollectionSearchBarView = Backbone.View.extend({
    el: '#vhost-search',
    events: {
      'keyup input': 'search'
    },
    initialize: function(options) {
      _.extend(this, options)
    },
    render: function() {
      return this
    },
    search: function(e) {
      var input = $(e.currentTarget),
          value = input.val(),
          vhostsCollection = new VhostsCollection()
      vhostsCollection.reset(this.collection.filter(function(vhost) {
        var test = new RegExp(value, 'i')
        return test.test(vhost.get('ServerName'))
      }))
      this.listView.render(vhostsCollection)
    }
  })

  var App = Backbone.View.extend({
    el: '#wrapper',
    initialize: function(options) {
      _.extend(this, options)
      this.vhostsCollection.reset(boostrapdata.vhosts)
      this.render()
    },
    render: function() {
      var vhostListView = new VhostListView({
        collection: this.vhostsCollection
      })
      var vhostCollectionSearchBarView = new VhostCollectionSearchBarView({
        collection: this.vhostsCollection,
        listView: vhostListView
      })
      this.$el.append(vhostListView.render().$el)
      return this
    }
  })

  window.app = new App({
    vhostsCollection: new VhostsCollection()
  })

})