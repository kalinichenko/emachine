'use strict';
window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap');
// console.log("BBBB: " + bootstrap);


document.addEventListener('DOMContentLoaded', function(event) {
  var Backbone = require('backbone');

  var App = require('./app');

  require('./entities/favorites');
  require('./entities/sentences');
  require('./entities/player');
  require('./apps/search');
  require('./apps/favorites');
  require('./apps/player');
  require('./apps/menu');


  App.start();
  Backbone.history.start();

});