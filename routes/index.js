function setupRouter(appglobals) {
  var express = require('express');
  var router = express.Router();
  
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('allpages');
  });
  
  router.get('/newpage/', function(req, res, next) {
    res.render('newpage');
  });
  
  router.get('/admin/', function(req, res, next) {
    res.render('adminindex', {
      cfgjson: JSON.stringify(appglobals.cfg)
    })
  });

  return router;
}

module.exports = setupRouter;
