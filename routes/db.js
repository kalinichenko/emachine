var mysql = require('mysql');
var express = require('express');
var router = express.Router();

var pageSize = 10;

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost',
  user            : 'emachine',
  password        : 'emachine',
  database        : 'emachine'
});

module.exports = {
  filter: function(callback, likeCondition) {
    if (likeCondition) {
      this._get('SELECT id, sentence_eng, sentence_rus FROM sentences WHERE sentence_eng like ? LIMIT ?',
          ['%' + likeCondition + '%', pageSize], callback);
    } else {
      this._get('SELECT id, sentence_eng, sentence_rus FROM sentences order by RAND() limit ?', [pageSize], callback);
    }
  },
  get: function(page, callback) {
    this._get('SELECT id, sentence_eng, sentence_rus FROM sentences LIMIT ?,?', [pageSize * page, pageSize], callback);
  },
  _get: function(sql, args, callback) {
    pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err);
        callback(true);
        return;
      }
      connection.query(sql, args, function(err, result) {
        connection.release();
        if (err) {
          console.log(err);
          callback(true);
          return;
        }
        callback(false, result);
      });
    });
  }

}


