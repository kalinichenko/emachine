'use strict';
var Howl = require('howler').Howl;
var Backbone = require('backbone');

var repeat = 0,
  minInterval = 3000,
  _audio,
  _next;

var _viewModel = new Backbone.Model();

function play() {
  _viewModel.set({
    'status': 'playing'
  });

  _audio.howl.play();
  console.log('play: ' + _viewModel.get('sentence_eng'));
}

function pause() {
  _viewModel.set({
    'status': 'paused'
  });

  if (_audio.timeoutId) {
    console.log('paused: clearTimeout: ' + _audio.timeoutId);
    clearTimeout(_audio.timeoutId);
    delete _audio.timeoutId;
  } else {
    _audio.howl.pause();
    console.log('audio.pause: ' + _viewModel.get('sentence_eng'));
  }

}

function _stop() {
  if (_audio.timeoutId) {
    console.log('stop: clearTimeout' + _audio.timeoutId);
    clearTimeout(_audio.timeoutId);
    delete _audio.timeoutId;
  } else {
    _audio.howl.stop();
    console.log('stop: audio.stop' + _viewModel.get('sentence_eng'));
  }
}

function next() {
  var index = _audio.collection.indexOf(_audio);
  var nextIdx = index + 1 < _audio.collection.length ? index + 1 : 0;
  return _audio.collection.at(nextIdx);
}

function onEnd() {
  console.log('onend: start :' + _viewModel.get('sentence_eng'));
  var interval = _audio.howl._duration * 1.25 * 1000;
  // console.log('onend: duration: ' + _audio.howl._duration);
  // console.log('onend: interval: ' + interval);

  var timeoutId = setTimeout(function() {
    console.log('onend: woken up:' + _viewModel.get('sentence_eng'));
    delete _audio.timeoutId;
    console.log('onend: delete timeoutId: ' + timeoutId);
    if (repeat >= 2) {
      _audio = next();
      _next = next();
      _viewModel.set(_audio.attributes);
      // _viewModel.set({
      //   'audio': next
      // });
      repeat = 0;
    } else {
      repeat++;
    }
    play();
  }, interval > minInterval ? interval : minInterval);

  console.log('onend: create timeoutId: ' + timeoutId);
  _audio.timeoutId = timeoutId;
  // console.log('onend: finish');
}

function load(audio, onLoad) {
  // console.log('load:' + audio.sentence_eng);

  audio.howl = new Howl({
    urls: ['http://nodejs-emachine.rhcloud.com/' + 'audio/' + audio.id + '.mp3'],
    // urls: ['audio/' + audio.id + '.mp3'],
    // autoplay: true,
    onend: onEnd,
    onload: function() {
      onLoad && onLoad();
    },
    onplay: function() {
      // preload next audio
      _next.howl || load(_next);
      console.log('preload: ' + _viewModel.get('sentence_eng'));
    }
  });
}

module.exports = {
  //TODO
  remove: function(audio) {

  },
  play: function(audio, onLoad) {
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
        load(audio, function() {
          onLoad && onLoad();
          console.log('onload: ' + _viewModel.get('sentence_eng'));
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