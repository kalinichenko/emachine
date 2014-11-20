var playList;

var howls,
    repeat = 0,
    idx = 0,
    isInterval = false,
    minInterval = 3000;

var $playCtrlBtn,
    $playListBtn,
    $searchBtn,
    $playListPanel,
    $sentenceEng,
    $sentenceRus;



function playNext() {
  isInterval = true;
  var interval = howls[idx]._duration * 1.25 * 1000;

  setTimeout(function() {
    if (repeat >= 2) {
      idx++;
      repeat = 0;
    } else {
      repeat++;
    }
    if (idx == howls.length) {
      idx = 0;
    }
    if (isInterval) {
      play();
      isInterval = false;
    }
  }, interval > minInterval ? interval : minInterval);
}


function play() {
  $sentenceEng.innerHTML = howls[idx].sentenceEng;
  $sentenceRus.innerHTML = howls[idx].sentenceRus;
  howls[idx].play();
}

function pause() {
  if (isInterval) {
    isInterval = false;
  } else {
    howls[idx].pause();
  }
}

function onDelete(event) {
  event.target.removeEventListener('click');
  var tr = event.target.parentNode.parentNode;
  for (var i = 0; i < howls.length; i++) {
    if (howls[i].id == tr.id) {
      howls.splice(i, 1);
      tr.remove();
      return;
    }
  }
}

function onPlay() {
  play();
  $playCtrlBtn.removeEventListener('click', onPlay);
  $playCtrlBtn.className = 'pause-button';
  $playCtrlBtn.addEventListener('click', onPause);

  $playListPanel.style.display = 'none';
  $playListBtn.style.display='inline-block';

  $sentencePanel.style.display='block';
}

function onPause() {
  pause();
  $playCtrlBtn.removeEventListener('click', onPause);
  $playCtrlBtn.className = 'play-button';
  $playCtrlBtn.addEventListener('click', onPlay);
}

function startPause() {
  $playCtrlBtn.className === 'play-button' ? onPlay() : onPause();
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

    var tbody = document.getElementById('play-list-table').children[0];
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    for (var i = 0; i < request.response.length; i++) {
      var howl = new Howl({
        urls: ['audio/' + request.response[i].id + '.mp3'],
        onend: playNext,
      });
      howl.id = request.response[i].id;
      howl.sentenceRus = request.response[i].sentence_rus;
      howl.sentenceEng = request.response[i].sentence_eng;
      howls.push(howl);
      var tr=document.createElement('tr');
      tr.id = request.response[i].id;

      var td0 = document.createElement('td');
      td0.appendChild(document.createTextNode(request.response[i].sentence_eng));
      td0.addEventListener('click', startPause);
      tr.appendChild(td0);

      var td1 = document.createElement('td');
      tr.appendChild(td1);

      var a = document.createElement('a');
      a.className = 'delete-item';
      a.addEventListener('click', onDelete);

      td1.appendChild(a)

      tbody.appendChild(tr);
    }
    if (request.response.length > 0) {
      $playCtrlBtn.style.display='inline-block';
    } else {
      $playCtrlBtn.style.display='none';
    }
  };

  request.onerror = function() {
    alert('load error');
  };

  request.send();
}

function onHidePlayList() {
  var $playListPanel = document.getElementById('play-list-panel');
  if (window.getComputedStyle($playListPanel).display === 'none') {
    $playListPanel.style.display = 'block';
    $playListBtn.style.display='none';
    onPause();
    $sentencePanel.style.display='none';
  } else {
    $playListPanel.style.display = 'none';
  }
}

function onKeyPress(e) {
  if (e.keyCode == 13) {
    var tb = document.getElementById("keyword");
    onSearch();
    return false;
  }
}

window.onload = function() {
  $playCtrlBtn = document.getElementById('play-ctrl-btn');
  $playCtrlBtn.addEventListener('click', onPlay);

  $playListBtn = document.getElementById('play-list-btn');
  $playListBtn.addEventListener('click', onHidePlayList);

  $searchBtn = document.getElementById('search-btn');
  $searchBtn.addEventListener('click', onSearch);

  $playListPanel = document.getElementById('play-list-panel');


  $sentencePanel = document.getElementById('sentence-panel');
  $sentencePanel.addEventListener('click', startPause);

  $sentenceEng = document.getElementById('sentence-eng');
  $sentenceRus = document.getElementById('sentence-rus');
}