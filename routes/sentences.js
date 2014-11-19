var mysql = require('mysql');
var express = require('express');
var router = express.Router();

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost',
  user            : 'emachine',
  password        : 'emachine',
  database        : 'emachine'
});


/* GET users listing. */
router.get('/', function(req, res) {
  var sentenceHas = req.query.like;
  res.type('application/json');
  if (!sentenceHas) res.send({});

  pool.getConnection(function(err, connection) {
    if (err) throw err;
    connection.query('SELECT id, sentence_eng, sentence_rus FROM sentences WHERE sentence_eng like ? LIMIT 10', '%' + sentenceHas + '%', function(err, rows) {
      if (err) {
        connection.release();
        throw err;
      } else {
        res.status(200).send(rows);
        connection.release();
      }
    });
  });
});

module.exports = router;
