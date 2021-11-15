function setupRouter(logic_globals) {
  const express = require('express');
  const path = require('path');
  var router = express.Router();
  
  router.get('/timetoid/', function(req, res, next) {
    res.redirect('./0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = logic_globals.timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids.output);    
  });

  router.get('/allpages/', function(req, res, next) {
    logic_globals.prom_getAllPages(res, (dbres) => {
      res.json(dbres);
    });
  });

  router.post('/dummy/', function(req, res, next) {
    res.json(req.body);
  });

  router.post('/addpage/', function(req, res, next) {
    timeint = Date.now().valueOf();
    logic_globals.prom_postPage(res, timeint, req.body, (dbres) => {
      console.log(dbres); // affectedRows, insertId, warningStatus
      res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', dbres[0].id, '/'));
    });
  });

  return router;
}

module.exports = setupRouter;
