'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var SentenceModel = Backbone.Model.extend({});

var SentenceCollection = Backbone.Collection.extend({
  model: SentenceModel,
  url: '/sentences'
});

var sentences = new SentenceCollection();

module.exports = {
  list: function(options) {
    sentences.fetch(options);
  }
};
