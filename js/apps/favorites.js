'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var favorites = require('../entities/favorites');
var SwipeOut = require('swipeout');

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'list',
    'favorites': 'list'
  }
});

var FavoriteTrView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: '#favorite-tr-template',
  triggers: {
    'click .del': 'favorite:del',
    'click .play': 'favorite:play'
  }
});

var FavoriteTableView = Marionette.CompositeView.extend({
  template: '#favorite-table-template',
  childView: FavoriteTrView,
  childViewContainer: 'tbody'
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
  className: 'list-unstyled list-bordered nav-stick row',
  childView: FavoriteLiView,
  onShow: function() {
    new SwipeOut(this.el);
  }
});



var FavoritesEmptyView = Marionette.ItemView.extend({
  template: '#favorites-empty-template',
  triggers: {
    'click .add': 'search:show'
  }
});


var API = {
  list: function() {
    App.commands.execute('menu:set-active', '.favorites');
    favorites.list().then(function(collection) {
      if (collection.length > 0) {

        var favoritesView;
        if(/iPhone/i.test(navigator.userAgent)) {
          favoritesView = new FavoriteListView({
            collection: collection
          });
        } else {
          favoritesView = new FavoriteTableView({
            collection: collection
          });
        }

        favoritesView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoritesView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });
        App.content.show(favoritesView);

      } else {
        var emptyView = new FavoritesEmptyView();
        emptyView.on('search:show', function() {
          App.trigger('search:show');
        });
        App.content.show(emptyView);
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