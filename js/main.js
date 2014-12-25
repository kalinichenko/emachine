'use strict';
//FIXME
window.$ = window.jQuery = require('jquery');
require('bootstrap');
var rivets = require('rivets');

// it needs just to initialize ios audio system
var Howl = require('howler').Howl;
new Howl({});

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


document.addEventListener('DOMContentLoaded', function() {
  var Backbone = require('backbone');

  var App = require('./app');

  require('./apps/search');
  require('./apps/favorites');
  require('./apps/player');
  require('./apps/menu');

  App.start();
  Backbone.history.start();

});