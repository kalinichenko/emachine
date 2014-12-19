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