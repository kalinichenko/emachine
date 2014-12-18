'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
Backbone.LocalStorage = require('backbone.localstorage');
var _ = require('underscore');

var FavoriteModel = Backbone.Model.extend({
  // Overwrite save function
  save: function(attrs, options) {
    options || (options = {});
    attrs || (attrs = _.clone(this.attributes));

    // Filter the data to send to the server
    delete attrs.howl;

    options.data = JSON.stringify(attrs);

    // Proxy the call to the original save function
    Backbone.Model.prototype.save.call(this, attrs, options);
  }
});

var FavoriteCollection = Backbone.Collection.extend({
  model: FavoriteModel,
  localStorage: new Backbone.LocalStorage('emachine')
});


var getFavorites = (function() {
  var favorites = new FavoriteCollection();
  var deferred = $.Deferred();
  favorites.fetch({
    success: deferred.resolve,
    error: deferred.reject
  });
  return function() {
    return deferred.promise();
  };
})();

module.exports = {
  list: function() {
    return getFavorites();
  },
  add: function(favorite) {
    getFavorites().then(function(favorites) {
      favorites.create(favorite);
    });
  },
  del: function(id) {
    getFavorites().then(function(favorites) {
      favorites.get(id).destroy();
    });
  }
};