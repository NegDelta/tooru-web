// These endpoints are to be called directly, and do not return pages.

function setupRouter(logic_globals) {
  var express = require('express');
  var path = require('path');
  var router = express.Router();

  router.post('/dummy/', function(req, res, next) {
    res.json(req.body);
  });

  router.get('/timetoid/', function(req, res, next) {
    res.redirect('./0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = logic_globals.timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids.output);    
  });

  // GET all pages
  router.get('/pages/', function(req, res, next) {
    logic_globals.prom_getAllPages(res, (dbres) => {
      res.json(dbres);
    });
  });

  // POST new page
  router.post('/pages/new/', function(req, res, next) {
    timeint = Date.now().valueOf();
    logic_globals.prom_postPage(res, timeint, req.body, (dbres) => {
      console.log(dbres);
      // HTTP 201 Created, with new page url in Location header
      var new_page_url = path.posix.join(logic_globals.cfg.url_root, '/api/pages/', dbres[0].id, '/');
      res.status(201).set(
        'Location', new_page_url
      ).end();
    });
  });

  // GET, PUT (edit), DELETE a given page
  router.all('/pages/:id([\\d-]+)/', function(req, res, next) {
    // catch-all for all verbs
    next()
  }).get(function(req, res, next) {
    logic_globals.prom_getPage(res, req.params.id, (dbres) => {
      page = dbres[0];
      res.json(page);
    });
  }).put(function(req, res, next) {
    timeint = Date.now().valueOf();
    console.log(req.body);
    logic_globals.prom_updatePage(res, timeint, req.body, req.params.id, (dbres) => {
      console.log(dbres);
      // HTTP 204 No Content
      res.status(204).end();
    });
  }).delete(function(req, res, next) {
    logic_globals.prom_deletePage(res, req.params.id, (dbres) => {
      console.log(dbres);
      // HTTP 204 No Content
      res.status(204).end();
    });
  });

  return router;
}

module.exports = setupRouter;
    