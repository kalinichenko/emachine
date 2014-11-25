var express = require('express');
var router = express.Router();
var db = require('./db');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Repeat after me'});
});

module.exports = router;
