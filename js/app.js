'use strict';

var jQuery, $;
$ = jQuery = require('jquery');

var Backbone = require('backbone');
Backbone.$ = jQuery;
var Marionette = require('backbone.marionette');


// var _ = require('underscore');

var App = new Marionette.Application({
  regions: {
    menu: '#menu',
    content: '#content'
  }
});

App.navigate = function(route, options) {
  options || (options = {});
  Backbone.history.navigate(route, options);
};

App.commands.execute('menu:show');

module.exports = App;