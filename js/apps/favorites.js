'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var $ = require('jquery');
var favorites = require('../entities/favorites');

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'list',
    'favorites': 'list'
  }
});

var FavoriteItemView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template($('#favorite-template').html()),
  triggers: {
    'click .del': 'favorite:del',
    'click .play': 'favorite:play'
  }
});

var FavoriteListView = Marionette.CompositeView.extend({
  className: 'favorites',
  childView: FavoriteItemView,
  childViewContainer: 'tbody',
  template: _.template($('#favorites-template').html()),
});

var FavoritesEmptyView = Marionette.ItemView.extend({
  template: _.template($('#favorites-empty-template').html()),
  triggers: {
    'click .add': 'search:show'
  }
});


var API = {
  list: function() {
    App.commands.execute('menu:set-active', '.favorites');
    favorites.list().then(function(collection, response, options) {
      var favoritesView;
      if (collection.length > 0) {
        favoritesView = new FavoriteListView({
          collection: collection
        });
        favoritesView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoritesView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });
      } else {
        favoritesView = new FavoritesEmptyView();
        favoritesView.on('search:show', function() {
          App.trigger('search:show');
        });
      }
      App.content.show(favoritesView);
    });
  }
};

App.on('favorite:list', function() {
  App.navigate('favorites');
  API.list();
});

App.addInitializer(function() {
  new Router({
    controller: API
  });
});