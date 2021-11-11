function setupRouter(logic_globals) {
  var express = require('express');
  var router = express.Router();
  
  /* GET home page. */
  router.get('/', function(req, res, next) {
    // all pages
    logic_globals.prom_get_all_pages()
    .then((rows) => {
      res.render('allpages', { pages: rows });
    })
    .catch(err => {
      //handle error
      console.log(err); 
    })
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
