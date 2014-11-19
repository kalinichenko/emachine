var playList;

var howls,
    repeat = 0,
    idx = 0,
    isInterval = false,
    minInterval = 3000;


function playNext() {
  isInterval = true;
  console.log(howls[idx]._duration);
  var interval = howls[idx]._duration * 1.5 * 1000;
  console.log(interval);

  setTimeout(function() {
    if (repeat >= 2) {
      idx++;
      repeat = 0;
    } else {
      repeat++;
    }
    if (idx == playList.length) {
      idx = 0;
    }
    if (isInterval) {
      play();
      isInterval = false;
    }
  }, interval < minInterval ? interval : minInterval);
}


function play() {
  document.getElementById('sentence_eng').innerHTML = playList[idx].sentence_eng;
  document.getElementById('sentence_rus').innerHTML = playList[idx].sentence_rus;
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

    var tbody = document.getElementById('play-list').children[0];
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    playList = request.response;

    for (var i = 0; i < playList.length; i++) {
      howls.push(new Howl({
        urls: ['audio/' + playList[i].id + '.mp3'],
        onend: playNext
      }));
      var tr=document.createElement('tr');
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(playList[i].sentence_eng));
      tr.appendChild(td);
      tbody.appendChild(tr);
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