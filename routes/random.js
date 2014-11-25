var express = require('express');
var router = express.Router();
var db = require('./db');


/* GET users listing. */
router.get('/', function(req, res) {
  res.type('application/json');

  db.random(function(err, result) {
    if(err) {
      res.status(500).send("Server Error");
      return;
    }
    res.send(result);
  });

});

module.exports = router;
