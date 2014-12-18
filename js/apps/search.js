'use strict';
var App = require('../app');

var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');

var favorites = require('../entities/favorites');
var sentences = require('../entities/sentences');


var HeaderView = Marionette.ItemView.extend({
  template: '#search-header-template',
  triggers: {
    'click a.favorites': 'favorite:list'
  }
});


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
    'criteria': '.sentences_filter-criteria'
  },
  events: {
    'click .sentences_filter-find': 'onFind',
    'keyup .sentences_filter-criteria': 'onEnter'
  },
  onFind: function() {
    this.trigger('sentences:find', this.ui.criteria.val());
  },
  onEnter: function(event) {
    if (event.keyCode === 13) {
      this.onFind();
    }
  }
});

var SentenceView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template($('#sentence-template').html()),
  triggers: {
    'click .sentence-add': 'sentence:add'
  }
});

var SentenceListView = Marionette.CompositeView.extend({
  childView: SentenceView,
  childViewContainer: 'tbody',
  collectionEvents: {
    'remove': 'render'
  },
  template: _.template($('#sentence-list-template').html())
});

var SentencesEmptyView = Marionette.ItemView.extend({
  template: _.template($('#sentences-empty-template').html())
});

var API = {
  show: function() {
    App.commands.execute('menu:set-active', '.search');
    var searchLayoutView = new SearchLayoutView();

    var filterView = new FilterView();
    filterView.on('sentences:find', function(criteria) {
      sentences.list({
        data: {
          'like': criteria
        },
        success: function(sentences) {
          var sentenceListView;
          if (sentences.length > 0) {
            sentenceListView = new SentenceListView({
              collection: sentences
            });
            sentenceListView.on('childview:sentence:add', function(childView) {
              favorites.add(childView.model.attributes);
              sentences.remove(childView.model);
            });
          } else {
            sentenceListView = new SentencesEmptyView();
          }
          searchLayoutView.list.show(sentenceListView);
        }
      });
    });
    App.content.show(searchLayoutView);
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