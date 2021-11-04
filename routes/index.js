var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: "all pages"});
});

router.get('/newpage/', function(req, res, next) {
  res.render('newpage', {title: "new page"});
});

module.exports = router;
