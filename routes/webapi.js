function setupRouter(logic_globals) {
  var express = require('express');
  var router = express.Router();
  
  router.get('/timetoid/', function(req, res, next) {
    res.redirect('./0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = logic_globals.timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids.output);    
  });

  router.get('/allpages/', function(req, res, next) {
    logic_globals.prom_getAllPages(res)
    .then((rows) => {
      res.json(rows);
    })
    .catch(err => {
      //handle error
      console.log(err); 
    })
  });

  router.post('/dummy/', function(req, res, next) {
    res.json(req.body);
  });

  router.post('/addpage/', function(req, res, next) {
    timeint = Date.now().valueOf();
    logic_globals.prom_dbConnection(res, logic_globals.prom_postPage(res, timeint, req.body));
  });

  return router;
}

module.exports = setupRouter;
