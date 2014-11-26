var express = require('express');
var router = express.Router();
var db = require('./db');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Repeat after me'});
});

module.exports = router;
