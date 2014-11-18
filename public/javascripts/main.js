var playList;

var idx = 0;
var interval = 2000;
var howls;
var isInterval = false;


function playNext() {
  isInterval = true;
  setTimeout(function() {
    idx++;
    if (idx == playList.length) {
      idx = 0;
    }
    if (isInterval) {
      play();
      isInterval = false;
    }
  }, interval);
}


function play() {
  document.getElementById('sentence').innerHTML = playList[idx].sentence;
  howls[idx].play();
}

function pause() {
  if (isInterval) {
    isInterval = false;
  } else {
    howls[idx].pause();
  }
}

function onPlay() {
  play();
  event.target.removeEventListener('click', onPlay);
  event.target.innerHTML = 'Pause';
  event.target.addEventListener('click', onPause);
}

function onPause() {
  pause();
  event.target.removeEventListener('click', onPause);
  event.target.innerHTML = 'Play';
  event.target.addEventListener('click', onPlay);
}

function onSearch() {
  howls = [];
  var keyword = document.getElementById('keyword').value;
  if(!keyword) return;

  var url = 'sentences?like=' + keyword;

  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "json";

  request.onload = function() {

    playList = request.response;

    for (var i = 0; i < playList.length; i++) {
      howls.push(new Howl({
        //
        urls: ['audio/' + playList[i].id + '.mp3'],
        onend: playNext
      }));
    }
  };

  request.onerror = function() {
    alert('load error');
  };

  request.send();
}


window.onload = function() {
  document.getElementById('ctrl-button').addEventListener('click', onPlay);
  document.getElementById('search-button').addEventListener('click', onSearch);
}