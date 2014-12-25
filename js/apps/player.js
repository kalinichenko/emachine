'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var favorites = require('../entities/favorites');
var player = require('../entities/player');
var rivets = require('rivets');

//TODO
/*
поиск: иногда не отображается результат после возвращения
badges
*/

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    'player/:id': 'show',
    'player': 'show'
  }
});

var PlayerView = Marionette.ItemView.extend({
  template: '#player-template',
  ui: {
    'playPause': '.play-pause'
  },
  triggers: {
    'click .paused': 'player:play',
    'click .playing': 'player:pause',
  },
  modelEvents: {
    'change:statusLoaded': 'onLoaded',
    'change:statusLoading': 'onLoading',
    'change:statusPlaying': 'onPlaying',
    'change:statusPaused': 'onPaused'
  },
  onRender: function() {
    this.binding = rivets.bind(this.$el, {
      model: this.model
    });
  },
  onDestroy: function() {
    this.binding.unbind();
  },
  onPlaying: function() {
    this.model.get('statusPlaying') && this.model.set('action', 'Pause');
  },
  onPaused: function() {
    this.model.get('statusPaused') &&  this.model.set('action', 'Play');
  },
  onLoaded: function() {
    this.model.get('statusLoaded') && this.ui.playPause.button('reset');
  },
  onLoading: function() {
    this.model.get('statusLoading') && this.ui.playPause.button('loading');
  }
});


var API = {
  show: function(id) {
    App.commands.execute('menu:set-active', '.player');
    favorites.list().then(function(collection, response, options) {

      var playerView = new PlayerView({
        model: player.viewModel()
      });

      playerView.on('player:play', function() {
        player.play();
      });
      playerView.on('player:pause', function() {
        player.pause();
      });
      App.content.show(playerView);

      var audio;
      if (id) {
        audio = collection.get(id);
      } else if (!player.viewModel().has('data')) {
        audio = collection.at(0);
      }
      audio && player.play(audio);
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