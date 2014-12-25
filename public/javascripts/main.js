(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
//FIXME
window.$ = window.jQuery = require('jquery');
require('bootstrap');
var rivets = require('rivets');

// it needs just to initialize ios audio system
var Howl = require('howler').Howl;
new Howl({});

rivets.adapters[':'] = {
  observe: function(model, key, callback) {
    model.on('change:' + key, callback);
  },
  unobserve: function(model, key, callback) {
    model.off('change:' + key, callback);
  },
  get: function(model, key) {
    return model.get(key);
  },
  set: function(model, key, value) {
    model.set(key, value);
  }
};


document.addEventListener('DOMContentLoaded', function() {
  var Backbone = require('backbone');

  var App = require('./app');

  require('./apps/search');
  require('./apps/favorites');
  require('./apps/player');
  require('./apps/menu');

  App.start();
  Backbone.history.start();

});
},{"./app":2,"./apps/favorites":3,"./apps/menu":4,"./apps/player":5,"./apps/search":6,"backbone":"backbone","bootstrap":"bootstrap","howler":"howler","jquery":"jquery","rivets":"rivets"}],2:[function(require,module,exports){
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
},{"backbone":"backbone","backbone.marionette":"backbone.marionette","jquery":"jquery"}],3:[function(require,module,exports){
'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var favorites = require('../entities/favorites');
var SwipeOut = require('swipeout');

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'list',
    'favorites': 'list'
  }
});

var FavoriteTrView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: '#favorite-tr-template',
  triggers: {
    'click .del': 'favorite:del',
    'click .play': 'favorite:play'
  }
});

var FavoriteTableView = Marionette.CompositeView.extend({
  template: '#favorite-table-template',
  childView: FavoriteTrView,
  childViewContainer: 'tbody'
});


var FavoriteLiView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'fixed-height clipping-text',
  template: _.template('<%= sentence_eng %>'),
  triggers: {
    'delete': 'favorite:del',
    'click': 'favorite:play'
  }
});

var FavoriteListView = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'list-unstyled list-bordered nav-stick row',
  childView: FavoriteLiView,
  onShow: function() {
    new SwipeOut(this.el);
  }
});



var FavoritesEmptyView = Marionette.ItemView.extend({
  template: '#favorites-empty-template',
  triggers: {
    'click .add': 'search:show'
  }
});


var API = {
  list: function() {
    App.commands.execute('menu:set-active', '.favorites');
    favorites.list().then(function(collection) {
      if (collection.length > 0) {

        var favoritesView;
        if(/iPhone/i.test(navigator.userAgent)) {
          favoritesView = new FavoriteListView({
            collection: collection
          });
        } else {
          favoritesView = new FavoriteTableView({
            collection: collection
          });
        }

        favoritesView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoritesView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });
        App.content.show(favoritesView);

      } else {
        var emptyView = new FavoritesEmptyView();
        emptyView.on('search:show', function() {
          App.trigger('search:show');
        });
        App.content.show(emptyView);
      }
    });
  }
};

App.on('favorite:list', function() {
  App.navigate('favorites');
  API.list();
});

App.addInitializer(function() {
  new Router({
    controller: API
  });
});
},{"../app":2,"../entities/favorites":7,"backbone.marionette":"backbone.marionette","swipeout":"swipeout","underscore":"underscore"}],4:[function(require,module,exports){
'use strict';
var App = require('../app');
var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var $ = require('jquery');
var rivets = require('rivets');

var favorites = require('../entities/favorites');

var menuView;

var MenuView = Marionette.ItemView.extend({
  template: '#menu-template',
  tagName: 'nav',
  className: 'navbar navbar-default',
  attributes: {
    role: 'navigation'
  },
  triggers: {
    'click .search': {
      event: 'search:show',
      stopPropagation: false
    },
    'click .player': {
      event: 'player:show',
      stopPropagation: false
    },
    'click .favorites': {
      event: 'favorite:list',
      stopPropagation: false
    }
  },
  events: {
    'click .collapse.in': 'collapseMenu'
  },
  onShow: function() {
    this.binding = rivets.bind(this.$el, {
      model: this.model
    });
  },
  onDestroy: function() {
    this.binding.unbind();
  },
  collapseMenu: function(e) {
    $(e.currentTarget).collapse('toggle');
  },
  setActive: function(selector) {
    this.$el.find('.active').removeClass('active');
    this.$el.find(selector).parent().addClass('active');
  }
});


var API = {
  show: function() {
    App.menu.show(menuView);
  },
  setActive: function(selector) {
    menuView.setActive(selector);
  }
};

favorites.list().then(function(collection) {
  var menuModel = new Backbone.Model();
  function setFavoriteCnt() {
    menuModel.set('favoriteCnt', collection.length);
  }
  setFavoriteCnt();
  collection.on('add remove', setFavoriteCnt);
  menuView = new MenuView({
    model: menuModel
  });
  menuView.on('search:show', function() {
    App.trigger('search:show');
  });
  menuView.on('player:show', function() {
    App.trigger('player:show');
  });
  menuView.on('favorite:list', function() {
    App.trigger('favorite:list');
  });

  App.commands.setHandler('menu:show', function() {
    API.show();
  });

  App.commands.setHandler('menu:set-active', function(selector) {
    API.setActive(selector);
  });

});


},{"../app":2,"../entities/favorites":7,"backbone":"backbone","backbone.marionette":"backbone.marionette","jquery":"jquery","rivets":"rivets"}],5:[function(require,module,exports){
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
},{"../app":2,"../entities/favorites":7,"../entities/player":8,"backbone.marionette":"backbone.marionette","rivets":"rivets"}],6:[function(require,module,exports){
'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var rivets = require('rivets');
var _ = require('underscore');
var SwipeOut = require('swipeout');

var favorites = require('../entities/favorites');
var searchService = require('../entities/search');


var SearchRouter = Marionette.AppRouter.extend({
  appRoutes: {
    'search': 'show'
  }
});

var SearchLayoutView = Backbone.Marionette.LayoutView.extend({
  className: 'finder',
  template: '#finder-layout-view-template',

  regions: {
    filter: '.finder-filter',
    list: '.finder-content'
  }
});

var FilterView = Marionette.ItemView.extend({
  className: 'sentences-filter',
  template: '#filter-template',
  ui: {
    'findButton': '.sentences_filter-find'
  },
  events: {
    'click .sentences_filter-find': 'onFind',
    'keyup .sentences_filter-criteria': 'onEnter'
  },
  loaded: function() {
    this.ui.findButton.button('reset');
  },
  onFind: function() {
    this.ui.findButton.button('loading');
    this.trigger('sentences:find');
  },
  onEnter: function(event) {
    if (event.keyCode === 13) {
      this.onFind();
    }
  },
  onShow: function() {
    this.binding = rivets.bind(this.$el, {
      model: this.model
    });
  },
  onDestroy: function() {
    this.binding.unbind();
  }
});


var SentencesEmptyView = Marionette.ItemView.extend({
  template: '#sentences-empty-template'
});

var ErrorView = Marionette.ItemView.extend({
  template: '#sentences-error-template',
  serializeData: function() {
    return this.model;
  }
});

var SentenceTrView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: '#sentence-template',
  triggers: {
    'click .sentence-add': 'sentence:add'
  }
});

var SentenceTableView = Marionette.CompositeView.extend({
  emptyView: SentencesEmptyView,
  childView: SentenceTrView,
  childViewContainer: 'tbody',
  collectionEvents: {
    'remove': 'render'
  },
  template: '#sentence-list-template'
});


var SentenceLiView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'fixed-height clipping-text',
  template: _.template('<%= sentence_eng %>'),
  triggers: {
    'delete': 'sentence:add',
  }
});

var SentenceListView = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'list-unstyled list-bordered row',
  childView: SentenceLiView,
  onShow: function() {
    new SwipeOut(this.el, {
      btnText: 'Add'
    });
  }
});


var API = {
  show: function() {

    App.commands.execute('menu:set-active', '.search');
    var searchLayoutView = new SearchLayoutView();
    App.content.show(searchLayoutView);

    function showSentences() {
      if (searchService.dataModel().has('sentences')) {
        var sentences = searchService.dataModel().get('sentences');
        var resultView;
        if (/iPhone/i.test(navigator.userAgent)) {
          resultView = new SentenceListView({
            collection: sentences
          });
        } else {
          resultView = new SentenceTableView({
            collection: sentences
          });
        }
        resultView.on('childview:sentence:add', function(childView) {
          favorites.add(childView.model.attributes);
          sentences.remove(childView.model);
        });
        searchLayoutView.list.show(resultView);
      }
    }

    // search filter
    var filterView = new FilterView({
      model: searchService.dataModel()
    });
    filterView.on('sentences:find', function() {
      searchService.list({
        success: function(sentences) {
          filterView.loaded();
          // search result
          searchService.dataModel().set('sentences', sentences);
          showSentences();
        },
        error: function(collection, response) {
          filterView.loaded();
          var resultView = new ErrorView({
            model: {
              status: response.status,
              statusText: response.statusText,
            }
          });
          searchLayoutView.list.show(resultView);
        }
      });

    });
    searchLayoutView.filter.show(filterView);
    showSentences();

  }
};

App.on('search:show', function() {
  App.navigate('search');
  API.show();
});

App.addInitializer(function() {
  new SearchRouter({
    controller: API
  });
});
},{"../app":2,"../entities/favorites":7,"../entities/search":9,"backbone":"backbone","backbone.marionette":"backbone.marionette","rivets":"rivets","swipeout":"swipeout","underscore":"underscore"}],7:[function(require,module,exports){
'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
Backbone.LocalStorage = require('backbone.localstorage');
var _ = require('underscore');

var FavoriteModel = Backbone.Model.extend({
  // Overwrite save function
  save: function(attrs, options) {
    options || (options = {});
    attrs || (attrs = _.clone(this.attributes));

    // Filter the data to send to the server
    delete attrs.howl;

    options.data = JSON.stringify(attrs);

    // Proxy the call to the original save function
    Backbone.Model.prototype.save.call(this, attrs, options);
  }
});

var FavoriteCollection = Backbone.Collection.extend({
  model: FavoriteModel,
  localStorage: new Backbone.LocalStorage('emachine')
});


var getFavorites = (function() {
  var favorites = new FavoriteCollection();
  var deferred = $.Deferred();
  favorites.fetch({
    success: deferred.resolve,
    error: deferred.reject
  });
  return function() {
    return deferred.promise();
  };
})();

module.exports = {
  list: function() {
    return getFavorites();
  },
  add: function(favorite) {
    getFavorites().then(function(favorites) {
      favorites.create(favorite);
    });
  },
  del: function(id) {
    getFavorites().then(function(favorites) {
      favorites.remove(favorites.get(id));
    });
  }
};
},{"backbone":"backbone","backbone.localstorage":"backbone.localstorage","jquery":"jquery","underscore":"underscore"}],8:[function(require,module,exports){
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
},{"backbone":"backbone","howler":"howler"}],9:[function(require,module,exports){
'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var SearchResult = Backbone.Model.extend({
  defaults: {
    'searchCriteria': ''
  }
});

var SentenceModel = Backbone.Model.extend({});

var SentenceCollection = Backbone.Collection.extend({
  model: SentenceModel,
  url: '/sentences'
});

var sentences = new SentenceCollection();

var _searchResult = new SearchResult();


module.exports = {
  list: function(options) {
    _searchResult.get('searchCriteria') && (options.data = {
      like: _searchResult.get('searchCriteria')
    });
    sentences.fetch(options);
  },
  dataModel: function() {
    return _searchResult;
  }

};
},{"backbone":"backbone","jquery":"jquery"}]},{},[1]);
