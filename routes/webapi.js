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
    if (req.body.pageid) {  // pageid is given; edit
      // find and update page
      console.log(req.body);
      logic_globals.prom_updatePage(res, timeint, req.body, (dbres) => {
        console.log(dbres); // affectedRows, insertId, warningStatus
        res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', req.body.pageid, '/'));
      });
    } else {  // pageid is NOT given
      // create new page
      logic_globals.prom_postPage(res, timeint, req.body, (dbres) => {
        console.log(dbres); // affectedRows, insertId, warningStatus
        res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', dbres[0].id, '/'));
      });
    }
  });
  
  router.post('/deletepage/', function(req, res, next) {
    logic_globals.prom_deletePage(res, req.body.pageid, (dbres) => {
      console.log(dbres); // affectedRows, insertId, warningStatus
      res.redirect(logic_globals.cfg.url_root);
    });
  });

  return router;
}

module.exports = setupRouter;
