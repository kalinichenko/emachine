'use strict';
var App = require('../app');
var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var $ = require('jquery');
var rivets = require('rivets');
var hello = require('hellojs');

var favorites = require('../entities/favorites');

var GOOGLE_CLIENT_ID = '1060900813305-cuinmlgsdtakomkfkb8mb1jeq9512i6a.apps.googleusercontent.com';
var menuView;

hello.init({
  google: GOOGLE_CLIENT_ID
}, {
  display: 'popup',
  redirect_uri: 'redirect.html',
  scope: 'profile',
  response_type: 'token'
});

hello.on('auth.login', function(auth){
  // call user information, for the given network
  hello( auth.network ).api( '/me' ).then( function(r){
    // labelEl.innerHTML = '<img src="'+ r.thumbnail +'" /> Hey ' + r.name
    console.log(r.name);
  });
});

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
    'click .signin': 'signin',
    'click .logout': 'logout',
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
  logout: function() {
    hello('google').logout().then(function() {
      alert("Signed out");
    }, function(e) {
      alert("Signed out error:" + e.error.message);
    });
  },
  signin: function() {
    var token;
    hello('google').login(function() {
      token = hello('google').getAuthResponse().access_token;
    }).then(function() {
      alert("You are signed in to Google");
    }, function(e) {
      alert("Signin error: " + e.error.message);
    });
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