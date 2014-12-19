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