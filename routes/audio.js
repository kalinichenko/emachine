var express = require('express');
var http = require('http');
var router = express.Router();

/* GET users listing. */
router.get('/:name', function(req, res) {

  var url = 'http://audio.tatoeba.org/sentences/eng/' + req.params.name;
  console.log(url);

  http.get(url, function(cres) {
    // wait for data
    cres.on('data', function(chunk) {
      res.write(chunk);
    });

    cres.on('end', function() {
      // finished, let's finish client request as well
      res.end();
    });

  }).on('error', function(e) {
    // we got an error, return 500 error to client and log error
    console.log(e.message);
    res.writeHead(500);
    res.end();
  });

});

module.exports = router;
