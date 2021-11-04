function setupRouter(appglobals) {
  var express = require('express');
  var router = express.Router();
  
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('allpages', {title: "all pages"});
  });
  
  router.get('/newpage/', function(req, res, next) {
    res.render('newpage', {title: "new page"});
  });
  
  router.get('/admin/', function(req, res, next) {
    res.render('adminindex', {
      title: 'admin',
      cfgjson: JSON.stringify(appglobals.cfg)
    })
  });

  return router;
}

module.exports = setupRouter;
