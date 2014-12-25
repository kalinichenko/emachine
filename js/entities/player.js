'use strict';
var Howl = require('howler').Howl;
var Backbone = require('backbone');

var repeat = 0,
  minInterval = 3000,
  _audio,
  _next;

var statuses = {
  ERROR: 'statusError',
  LOADING: 'statusLoading',
  LOADED: 'statusLoaded',
  PLAYING: 'statusPlaying',
  PAUSED: 'statusPaused'
};

var ViewModel = Backbone.Model.extend({
  defaults: {
    'action': 'Pause'
  }
});

var _viewModel = new ViewModel();

function _setStatus(status) {
  _viewModel.set(status, true);
  for (var key in _viewModel.attributes) {
    if (key !== status && key.indexOf('status') === 0) {
      _viewModel.set(key, false);
    }
  }
}

function _play() {
  _setStatus(statuses.PLAYING);
  _audio.howl.play();
}

function _pause() {
  _setStatus(statuses.PAUSED);
  if (_audio.timeoutId) {
    clearTimeout(_audio.timeoutId);
    delete _audio.timeoutId;
  } else {
    _audio.howl.pause();
  }

}

function _stop() {
  if (_audio.timeoutId) {
    clearTimeout(_audio.timeoutId);
    delete _audio.timeoutId;
  } else {
    _audio.howl.stop();
  }
}

function next() {
  var index = _audio.collection.indexOf(_audio);
  var nextIdx = index + 1 < _audio.collection.length ? index + 1 : 0;
  return _audio.collection.at(nextIdx);
}

function onEnd() {
  var interval = _audio.howl._duration * 1.25 * 1000;

  var timeoutId = setTimeout(function() {
    delete _audio.timeoutId;
    if (repeat >= 2) {
      _audio = next();
      _next = next();
      _viewModel.set('data', _audio.attributes);
      repeat = 0;
    } else {
      repeat++;
    }
    _audio.howl.play();
  }, interval > minInterval ? interval : minInterval);

  _audio.timeoutId = timeoutId;
}

function load(audio, onLoad) {
  audio.howl = new Howl({
    // urls: ['http://nodejs-emachine.rhcloud.com/' + 'audio/' + audio.id + '.mp3'],
    urls: ['audio/' + audio.id + '.mp3'],
    onend: onEnd,
    onload: function() {
      onLoad && onLoad();
    },
    onloaderror: function(error) {
      _setStatus(statuses.ERROR);
      _viewModel.set('errorType', error ? error.type : 'unknown');
    },
    onplay: function() {
      // preload next audio
      _next.howl || load(_next);
    }
  });
}

module.exports = {
  //TODO
  remove: function(audio) {

  },
  play: function(audio) {
    if (!audio) {
      _play();
    } else {
      if (_viewModel.has('data') && _viewModel.get('data').id !== audio.id) {
        _stop();
      }
      if (!_viewModel.has('data') || _viewModel.get('data').id !== audio.id) {
        _audio = audio;
        _next = next();
        _viewModel.set({
          data: _audio.attributes
        });
        if (!_audio.howl) {
          _setStatus(statuses.LOADING);
          load(audio, function() {
            _setStatus(statuses.LOADED);
            _play();
          });
        } else {
          _play();
        }
      }
    }
  },
  pause: function() {
    _pause();
  },
  viewModel: function() {
    return _viewModel;
  }
};