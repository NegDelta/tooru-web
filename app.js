var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mariadb = require('mariadb');

const cfg = require('./config')
mdb_pool = mariadb.createPool(cfg.dbpool);

const appglobals = {
  mdb_pool: mdb_pool,
  cfg: cfg
};

var indexRouter = require('./routes/index')(appglobals);
var apiRouter = require('./routes/api')(appglobals);

// wrapper to take care to the base url problem
var app_wrap = express();
var app = express();
app_wrap.use(cfg.url_root, app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// always send url_root to renderer
app.use(function(req, res, next) {
  res.locals.url_root = cfg.url_root;
  next()
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
