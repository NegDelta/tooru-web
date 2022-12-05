// These endpoints are to be called from the web UI forms.
const multer = require('multer');
const storage = multer.memoryStorage()
const mw_upload = multer({ storage: storage })

function setupRouter(logic_globals) {
  var express = require('express');
  var path = require('path');
  var router = express.Router();

  router.post('/pages/new/', function(req, res, next) {
    timeint = Date.now().valueOf();
    logic_globals.prom_postPage(res, timeint, req.body, (dbres) => {
      console.log(dbres);
      res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', dbres[0].id, '/'));
    });
  });

  router.post('/pages/:id([\\d-]+)/update/', function(req, res, next) {
    timeint = Date.now().valueOf();
    console.log(req.body);
    logic_globals.prom_updatePage(res, timeint, req.body, req.params.id, (dbres) => {
      console.log(dbres);
      res.redirect(path.posix.join(logic_globals.cfg.url_root, '/pages/', req.params.id, '/'));
    });
  });
  
  router.post('/pages/:id([\\d-]+)/delete/', function(req, res, next) {
    logic_globals.prom_deletePage(res, req.params.id, (dbres) => {
      console.log(dbres);
      res.redirect(logic_globals.cfg.url_root);
    });
  });

  router.post('/upload/', mw_upload.single('uploadfile'), function(req, res, next) {
    const uploaded_obj = JSON.parse(req.file.buffer);
    const found_pages = logic_globals.find_pages(uploaded_obj);
    res.render('uploadresult', {
      found_pages: found_pages,
      page_filename: req.file.originalname
    })
  });

  return router;
}

module.exports = setupRouter;
  