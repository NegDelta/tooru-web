function setupRouter(logic_globals) {
  var express = require('express');
  var path = require('path');
  var router = express.Router();
  
  function add_fmtted_time(page) {
    page.rendered_time = logic_globals.time_fmt(page.time)
    page.rendered_edit_time = logic_globals.time_fmt(page.edit_time)
  }

  /* GET home page. */
  router.get('/', function(req, res, next) {
    // all pages
    logic_globals.prom_getAllPages(res, (dbres) => {
      dbres.forEach(add_fmtted_time);
      res.render('allpages', { pages: dbres });
    });
  });

  router.get('/pages/:id/', function(req, res, next) {
    logic_globals.prom_getPage(res, req.params.id, (dbres) => {
      page = dbres[0];
      add_fmtted_time(page);
      res.render('onepage', {
        page: page,
        pagetype_menu_entries: [
          { text: 'edit', path: path.posix.join('pages/', req.params.id, 'edit/')}
        ]
      });
    });
  });

  router.get('/pages/:id/edit/', function(req, res, next) {
    logic_globals.prom_getPage(res, req.params.id, (dbres) => {
      page = dbres[0];
      add_fmtted_time(page);
      res.render('newpage', { page: page });
    });
  });
  
  router.get('/newpage/', function(req, res, next) {
    res.render('newpage');
  });
  
  router.get('/admin/', function(req, res, next) {
    res.render('adminindex', {
      cfgjson: JSON.stringify(logic_globals.cfg)
    })
  });

  return router;
}

module.exports = setupRouter;
