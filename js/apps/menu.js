'use strict';
var App = require('../app');
var Marionette = require('backbone.marionette');
var $ = require('jquery');


var MenuView = Marionette.ItemView.extend({
  template: '#menu-template',
  triggers: {
    'click .search': 'search:show',
    'click .player': 'player:show',
    'click .favorites': 'favorite:list',
  },
  events: {
    'click .nav a': 'onClick'
  },
  onClick: function(e) {
    this.$el.find('.active').removeClass('active');
    $(e.target).parent().addClass('active');
    this.$el.find('.collapse.in').collapse('toggle');
  },
  setActive: function(selector) {
    this.$el.find('.active').removeClass('active');
    this.$el.find(selector).parent().addClass('active');
  }
});

var menuView = new MenuView();

var API = {
  show: function() {
    menuView.on('search:show', function() {
      App.trigger('search:show');
    });
    menuView.on('player:show', function() {
      App.trigger('player:show');
    });
    menuView.on('favorite:list', function() {
      App.trigger('favorite:list');
    });

    App.menu.show(menuView);
  },
  setActive: function(selector) {
    menuView.setActive(selector);
  }
};

App.commands.setHandler('menu:show', function() {
  API.show();
});

App.commands.setHandler('menu:set-active', function(selector) {
  API.setActive(selector);
});
