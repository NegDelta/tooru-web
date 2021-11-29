//  TO BE RENAMED TO web_ui.js

function setupRouter(logic_globals) {
  var express = require('express');
  var path = require('path');
  var router = express.Router();
  
  function add_fmtted_time(page) {
    page.rendered_time = logic_globals.time_fmt(page.time)
    page.rendered_edit_time = logic_globals.time_fmt(page.edit_time)
  }

  function rtcb_getAllPages(req, res, next) {
    // all pages
    logic_globals.prom_getAllPages(res, (dbres) => {
      dbres.forEach(add_fmtted_time);
      res.render('allpages', { pages: dbres });
    });
  }

  router.get('/', rtcb_getAllPages);
  router.get('/pages/', rtcb_getAllPages);

  router.get('/pages/:id([\\d-]+)/', function(req, res, next) {
    logic_globals.prom_getPage(res, req.params.id, (dbres) => {
      page = dbres[0];
      add_fmtted_time(page);
      res.render('onepage', {
        page: page,
        pagetype_menu_entries: [
          { text: 'edit', path: path.posix.join('pages/', req.params.id, 'edit/')},
          { text: 'delete', path: path.posix.join('pages/', req.params.id, 'delete/')}
        ]
      });
    });
  });

  router.get('/pages/:id([\\d-]+)/edit/', function(req, res, next) {
    logic_globals.prom_getPage(res, req.params.id, (dbres) => {
      page = dbres[0];
      add_fmtted_time(page);
      res.render('newpage', {
        page: page, 
        title: 'edit page',
        target: path.posix.join('pages', req.params.id, 'update')
      });
    });
  });

  router.get('/pages/:id([\\d-]+)/delete/', function(req, res, next) {
    res.render('deletepage', { page: page });
  });
  
  router.get('/pages/new/', function(req, res, next) {
    res.render('newpage', {
      page: {}, 
      title: 'new page',
      target: 'pages/new'
    });
  });
  
  router.get('/admin/', function(req, res, next) {
    res.render('adminindex', {
      cfgjson: JSON.stringify(logic_globals.cfg)
    })
  });

  return router;
}

module.exports = setupRouter;
