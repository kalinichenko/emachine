'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var $ = require('jquery');
var favorites = require('../entities/favorites');
var SwipeOut = require('swipeout');

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'list',
    'favorites': 'list'
  }
});

var FavoriteLayoutView = Marionette.LayoutView.extend({
  template: '#favorite-layout-view-template',

  regions: {
    list: '.favorite-list',
    table: '.favorite-table'
  }
});

var FavoriteTrView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template($('#favorite-tr-template').html()),
  triggers: {
    'click .del': 'favorite:del',
    'click .play': 'favorite:play'
  }
});

var FavoriteTableView = Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: FavoriteTrView
});

var FavoriteLiView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'fixed-height clipping-text',
  template: _.template('<%= sentence_eng %>'),
  triggers: {
    'delete': 'favorite:del',
    'click': 'favorite:play'
  }
});

var FavoriteListView = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'list-unstyled list-bordered nav-stick',
  childView: FavoriteLiView,
  onShow: function() {
    new SwipeOut(this.el);
  }
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
    favorites.list().then(function(collection) {
      if (collection.length > 0) {

        var layoutView = new FavoriteLayoutView();
        App.content.show(layoutView);

        var favoriteTableView = new FavoriteTableView({
          collection: collection
        });
        layoutView.table.show(favoriteTableView);

        favoriteTableView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoriteTableView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });


        var favoriteListView = new FavoriteListView({
          collection: collection
        });
        layoutView.list.show(favoriteListView);

        favoriteListView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoriteListView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });

      } else {
        var favoritesView = new FavoritesEmptyView();
        favoritesView.on('search:show', function() {
          App.trigger('search:show');
        });
        App.content.show(favoritesView);
      }
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