(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
//FIXME
window.$ = window.jQuery = require('jquery');
require('bootstrap');
var rivets = require('rivets');

// it needs just to initialize ios audio system
var Howl = require('howler').Howl;
new Howl({});


document.addEventListener('DOMContentLoaded', function() {
  var Backbone = require('backbone');

  var App = require('./app');

  require('./apps/search');
  require('./apps/favorites');
  require('./apps/player');
  require('./apps/menu');

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
var $ = require('jquery');
var favorites = require('../entities/favorites');
var SwipeOut = require('swipeout');

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'list',
    'favorites': 'list'
  }
});

var FavoriteLayoutView = Marionette.LayoutView.extend({
  template: '#favorite-layout-view-template',

  regions: {
    list: '.favorite-list',
    table: '.favorite-table'
  }
});

var FavoriteTrView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template($('#favorite-tr-template').html()),
  triggers: {
    'click .del': 'favorite:del',
    'click .play': 'favorite:play'
  }
});

var FavoriteTableView = Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: FavoriteTrView
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
  className: 'list-unstyled list-bordered nav-stick',
  childView: FavoriteLiView,
  onShow: function() {
    new SwipeOut(this.el);
  }
});



var FavoritesEmptyView = Marionette.ItemView.extend({
  template: _.template($('#favorites-empty-template').html()),
  triggers: {
    'click .add': 'search:show'
  }
});


var API = {
  list: function() {
    App.commands.execute('menu:set-active', '.favorites');
    favorites.list().then(function(collection) {
      if (collection.length > 0) {

        var layoutView = new FavoriteLayoutView();
        App.content.show(layoutView);

        var favoriteTableView = new FavoriteTableView({
          collection: collection
        });
        layoutView.table.show(favoriteTableView);

        favoriteTableView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoriteTableView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });


        var favoriteListView = new FavoriteListView({
          collection: collection
        });
        layoutView.list.show(favoriteListView);

        favoriteListView.on('childview:favorite:del', function(childView) {
          favorites.del(childView.model.id);
        });
        favoriteListView.on('childview:favorite:play', function(childView) {
          App.trigger('player:show', childView.model.id);
        });

      } else {
        var favoritesView = new FavoritesEmptyView();
        favoritesView.on('search:show', function() {
          App.trigger('search:show');
        });
        App.content.show(favoritesView);
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
},{"../app":2,"../entities/favorites":7,"backbone.marionette":"backbone.marionette","jquery":"jquery","swipeout":"swipeout","underscore":"underscore"}],4:[function(require,module,exports){
'use strict';
var App = require('../app');
var Marionette = require('backbone.marionette');
var $ = require('jquery');


var MenuView = Marionette.ItemView.extend({
  template: '#menu-template',
  triggers: {
    'click .search': 'search:show',
    'click .player': 'player:show',
    'click .favorites': 'favorite:list',
  },
  events: {
    'click .nav a': 'onClick'
  },
  onClick: function(e) {
    this.$el.find('.active').removeClass('active');
    $(e.target).parent().addClass('active');
    this.$el.find('.collapse.in').collapse('toggle');
  },
  setActive: function(selector) {
    this.$el.find('.active').removeClass('active');
    this.$el.find(selector).parent().addClass('active');
  }
});

var menuView = new MenuView();

var API = {
  show: function() {
    menuView.on('search:show', function() {
      App.trigger('search:show');
    });
    menuView.on('player:show', function() {
      App.trigger('player:show');
    });
    menuView.on('favorite:list', function() {
      App.trigger('favorite:list');
    });

    App.menu.show(menuView);
  },
  setActive: function(selector) {
    menuView.setActive(selector);
  }
};

App.commands.setHandler('menu:show', function() {
  API.show();
});

App.commands.setHandler('menu:set-active', function(selector) {
  API.setActive(selector);
});

},{"../app":2,"backbone.marionette":"backbone.marionette","jquery":"jquery"}],5:[function(require,module,exports){
'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var _ = require('underscore');
var $ = require('jquery');
var favorites = require('../entities/favorites');
var player = require('../entities/player');
var rivets = require('rivets');

//TODO
/*
подтверждение добавления и удаления
поиск: иногда не отображается результат после возвращения
свайп удаление
badges
*/


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
},{"../app":2,"../entities/favorites":7,"../entities/player":8,"backbone.marionette":"backbone.marionette","jquery":"jquery","rivets":"rivets","underscore":"underscore"}],6:[function(require,module,exports){
'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
var rivets = require('rivets');

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
  template: _.template($('#filter-template').html()),
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

var SentenceView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template($('#sentence-template').html()),
  triggers: {
    'click .sentence-add': 'sentence:add'
  }
});

var SentencesEmptyView = Marionette.ItemView.extend({
  template: _.template($('#sentences-empty-template').html())
});

var ErrorView = Marionette.ItemView.extend({
  template: _.template($('#sentences-error-template').html()),
  serializeData: function() {
    return this.model;
  }
});


var SentenceListView = Marionette.CompositeView.extend({
  emptyView: SentencesEmptyView,
  childView: SentenceView,
  childViewContainer: 'tbody',
  collectionEvents: {
    'remove': 'render'
  },
  template: _.template($('#sentence-list-template').html())
});


var API = {
  show: function() {

    App.commands.execute('menu:set-active', '.search');
    var searchLayoutView = new SearchLayoutView();
    App.content.show(searchLayoutView);


    // search filter
    var filterView = new FilterView({
      model: searchService.dataModel()
    });
    filterView.on('sentences:find', function() {
      searchService.list({
        success: function() {
          filterView.loaded();
          // search result
          // if (!sentenceListView) {
            var sentences = searchService.dataModel().get('sentences');
            var resultView = new SentenceListView({
              collection: sentences
            });
            resultView.on('childview:sentence:add', function(childView) {
              favorites.add(childView.model.attributes);
              sentences.remove(childView.model);
            });
            searchLayoutView.list.show(resultView);
          // }
        },
        error: function(collection, response, options) {
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
},{"../app":2,"../entities/favorites":7,"../entities/search":9,"backbone":"backbone","backbone.marionette":"backbone.marionette","jquery":"jquery","rivets":"rivets","underscore":"underscore"}],7:[function(require,module,exports){
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
      favorites.get(id).destroy();
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

var _searchResult = new SearchResult({
  sentences: sentences
});


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
