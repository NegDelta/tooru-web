var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const logic_globals = require('./logic.js');

var rt_web_ui = require('./routes/web_ui')(logic_globals);
var rt_web_api = require('./routes/web_api')(logic_globals);
var rt_json_api = require('./routes/json_api')(logic_globals);

// wrapper to take care to the base url problem
var app_wrap = express();
var app = express();
app_wrap.use(logic_globals.cfg.url_root, app);

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
  res.locals.url_root = logic_globals.cfg.url_root;
  res.locals.main_menu_entries = logic_globals.main_menu_entries;
  next()
});

app.use('/', rt_web_ui);
app.use('/', rt_web_api);
app.use('/api', rt_json_api);

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
