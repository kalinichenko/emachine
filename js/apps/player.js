'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var $ = require('jquery');
var favorites = require('../entities/favorites');
var player = require('../entities/player');
var rivets = require('rivets');


var Router = Marionette.AppRouter.extend({
  appRoutes: {
    'player/:id': 'show',
    'player': 'show'
  }
});


var PlayerView = Marionette.ItemView.extend({
  template: _.template($('#player-template').html()),
  ui: {
    'playPause': '.play-pause'
  },
  triggers: {
    'click .play-pause': 'player:play-pause'
  },
  onShow: function() {
    this.binding = rivets.bind(this.$el, {
      model: this.model
    });
  },
  onDestroy: function() {
    this.binding.unbind();
  },
  loaded: function() {
    this.ui.playPause.button('reset');
  },
  loading: function() {
    this.ui.playPause.button('loading');
  }
});


var API = {
  show: function(id) {
    App.commands.execute('menu:set-active', '.player');
    favorites.list().then(function(collection, response, options) {

      var playerView = new PlayerView({
        model: player.viewModel()
      });

      playerView.on('player:play-pause', function() {
        if (playerView.model.get('action') === 'Pause') {
          player.pause();
        } else {
          player.play();
        }
      });
      App.content.show(playerView);

      var audio;
      if (id) {
        audio = collection.get(id);
      } else if (!player.viewModel().has('id')) {
        audio = collection.at(0);
      }
      audio && player.play(audio, function() {
        playerView.loading();
      }, function() {
        playerView.loaded();
      });



    });
  }
};

App.on('player:show', function(id) {
  App.navigate('player' + (id ? ('/' + id) : ''));
  API.show(id);
});

App.addInitializer(function() {
  new Router({
    controller: API
  });
});