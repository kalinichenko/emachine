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