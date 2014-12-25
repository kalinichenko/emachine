'use strict';
var App = require('../app');
var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var $ = require('jquery');
var rivets = require('rivets');

var favorites = require('../entities/favorites');

var menuView;

var MenuView = Marionette.ItemView.extend({
  template: '#menu-template',
  tagName: 'nav',
  className: 'navbar navbar-default',
  attributes: {
    role: 'navigation'
  },
  triggers: {
    'click .search': {
      event: 'search:show',
      stopPropagation: false
    },
    'click .player': {
      event: 'player:show',
      stopPropagation: false
    },
    'click .favorites': {
      event: 'favorite:list',
      stopPropagation: false
    }
  },
  events: {
    'click .collapse.in': 'collapseMenu'
  },
  onShow: function() {
    this.binding = rivets.bind(this.$el, {
      model: this.model
    });
  },
  onDestroy: function() {
    this.binding.unbind();
  },
  collapseMenu: function(e) {
    $(e.currentTarget).collapse('toggle');
  },
  setActive: function(selector) {
    this.$el.find('.active').removeClass('active');
    this.$el.find(selector).parent().addClass('active');
  }
});


var API = {
  show: function() {
    App.menu.show(menuView);
  },
  setActive: function(selector) {
    menuView.setActive(selector);
  }
};

favorites.list().then(function(collection) {
  var menuModel = new Backbone.Model();
  function setFavoriteCnt() {
    menuModel.set('favoriteCnt', collection.length);
  }
  setFavoriteCnt();
  collection.on('add remove', setFavoriteCnt);
  menuView = new MenuView({
    model: menuModel
  });
  menuView.on('search:show', function() {
    App.trigger('search:show');
  });
  menuView.on('player:show', function() {
    App.trigger('player:show');
  });
  menuView.on('favorite:list', function() {
    App.trigger('favorite:list');
  });

  App.commands.setHandler('menu:show', function() {
    API.show();
  });

  App.commands.setHandler('menu:set-active', function(selector) {
    API.setActive(selector);
  });

});

