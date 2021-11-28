//  TO BE RENAMED TO json_api.js

function setupRouter(logic_globals) {
  const express = require('express');
  const path = require('path');
  var router = express.Router();
  
  /// API global

  router.get('/timetoid/', function(req, res, next) {
    res.redirect('./0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = logic_globals.timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids.output);    
  });

  router.post('/dummy/', function(req, res, next) {
    res.json(req.body);
  });

  /// /pages/

  router.get('/pages/', function(req, res, next) {
    logic_globals.prom_getAllPages(res, (dbres) => {
      res.json(dbres);
    });
  });

  router.post('/pages/new/', function(req, res, next) {
    timeint = Date.now().valueOf();
    logic_globals.prom_postPage(res, timeint, req.body, (dbres) => {
      console.log(dbres); // affectedRows, insertId, warningStatus
      res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', dbres[0].id, '/'));
    });
  });

  router.post('/pages/:id/update/', function(req, res, next) {
    timeint = Date.now().valueOf();
    console.log(req.body);
    logic_globals.prom_updatePage(res, timeint, req.body, req.params.id, (dbres) => {
      console.log(dbres); // affectedRows, insertId, warningStatus
      res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', req.params.id, '/'));
    });
  });
  
  router.post('/pages/:id/delete/', function(req, res, next) {
    logic_globals.prom_deletePage(res, req.params.id, (dbres) => {
      console.log(dbres); // affectedRows, insertId, warningStatus
      res.redirect(logic_globals.cfg.url_root);
    });
  });

  return router;
}

module.exports = setupRouter;
