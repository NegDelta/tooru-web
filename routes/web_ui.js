// These endpoints are to be called directly from the user or web UI links, and return pages. These should be idempotent.

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
      res.render('allpages', {
        pages: dbres,
        pagetype_menu_entries: logic_globals.menu_entries.pagecoll_sub
      });
    });
  }

  router.get('/', rtcb_getAllPages);
  router.get('/pages/', rtcb_getAllPages);

  router.get('/pages/new/', function(req, res, next) {
    res.render('newpage', {
      page: {}, 
      title: 'new page',
      target: 'pages/new'
    });
  });

  var rt_page = express.Router();

  rt_page.get('/', function(req, res, next) {
    logic_globals.prom_getPage(res, res.locals.pageid, (dbres) => {
      if (dbres.length == 0) {
        next('route');  // pass out into 404 middleware
        return;
      }
      page = dbres[0];
      add_fmtted_time(page);
      res.render('onepage', {
        page: page,
        pagetype_menu_entries: [
          { text: 'edit', path: path.posix.join('pages/', res.locals.pageid, 'edit/')},
          { text: 'delete', path: path.posix.join('pages/', res.locals.pageid, 'delete/')},
          { text: 'download', path: path.posix.join('api/pages/', res.locals.pageid, '?dl=1')}
        ]
      });
    });
  });

  rt_page.get('/edit/', function(req, res, next) {
    logic_globals.prom_getPage(res, res.locals.pageid, (dbres) => {
      page = dbres[0];
      add_fmtted_time(page);
      res.render('newpage', {
        page: page, 
        title: 'edit page',
        target: path.posix.join('pages', res.locals.pageid, 'update')
      });
    });
  });

  rt_page.get('/delete/', function(req, res, next) {
    logic_globals.prom_getPage(res, res.locals.pageid, (dbres) => {
      page = dbres[0];
      res.render('deletepage', {
        page: page,
      });
    });
  });
  
  router.use('/pages/:id([\\d-]+)/', function(req, res, next) {
    res.locals.pageid = req.params.id;
    next();
  }, rt_page);
   
  router.get('/admin/', function(req, res, next) {
    res.render('adminindex', {
      cfgjson: JSON.stringify(logic_globals.cfg)
    })
  });

  router.get('/upload/', function(req, res, next) {
    res.render('uploadpages', {
      //
    })
  });

  return router;
}

module.exports = setupRouter;
