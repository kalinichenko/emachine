'use strict';
var Howl = require('howler').Howl;
var Backbone = require('backbone');

var repeat = 0,
  minInterval = 3000,
  _audio,
  _next;


var ViewModel = Backbone.Model.extend({
  defaults: {
    'action': 'Pause',
    'sentence_eng': '',
    'sentence_rus': ''
  }
});

var _viewModel = new ViewModel();

function play() {
  _viewModel.set({
    'action': 'Pause',
  });

  _audio.howl.play();
}

function pause() {
  _viewModel.set({
    'action': 'Play',
  });

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
      _viewModel.set(_audio.attributes);
      repeat = 0;
    } else {
      repeat++;
    }
    play();
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
      _viewModel.set({
        'error': true,
        'type': error.type
      });


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
  play: function(audio, onLoading, onLoaded) {
    if (!audio) {
      play();
    } else {
      if (_viewModel.has('id') && _viewModel.get('id') !== audio.id) {
        _stop();
      }
      _audio = audio;
      _next = next();
      _viewModel.set(_audio.attributes);
      if (!_audio.howl) {
        onLoading && onLoading();
        load(audio, function() {
          onLoaded && onLoaded();
          play();
        });
      } else {
        play();
      }
    }
  },
  pause: function() {
    pause();
  },
  viewModel: function() {
    return _viewModel;
  }
};