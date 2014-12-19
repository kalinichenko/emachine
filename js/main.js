'use strict';
//FIXME
window.$ = window.jQuery = require('jquery');
require('bootstrap');
var rivets = require('rivets');


document.addEventListener('DOMContentLoaded', function() {
  var Backbone = require('backbone');

  var App = require('./app');

  require('./apps/search');
  require('./apps/favorites');
  require('./apps/player');
  require('./apps/menu');

  rivets.adapters[':'] = {
    observe: function(model, key, callback) {
      model.on('change:' + key, callback);
    },
    unobserve: function(model, key, callback) {
      model.off('change:' + key, callback);
    },
    get: function(model, key) {
      return model.get(key);
    },
    set: function(model, key, value) {
      model.set(key, value);
    }
  };

  App.start();
  Backbone.history.start();

});