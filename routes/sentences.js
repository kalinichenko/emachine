var express = require('express');
var router = express.Router();
var db = require('./db');


/* GET users listing. */
router.get('/', function(req, res) {
  var sentenceHas = req.query.like;
  res.type('application/json');
  if (!sentenceHas) res.send({});

  db.filter(sentenceHas, function(err, result) {
    if(err) {
      res.status(500).send("Server Error");
      return;
    }
    res.send(result);
  });

});

module.exports = router;
