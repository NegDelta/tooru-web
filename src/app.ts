import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import rt_web_ui from './routes/web_ui';
import rt_web_api from './routes/web_api';
import rt_json_api from './routes/json_api';
import { cfg, menu_entries } from './logic';

// wrapper to take care to the base url problem
const app_wrap = express();
const app = express();
app_wrap.use(cfg.url_root, app);

// view engine setup
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../src/public')));

// always send url_root to renderer
app.use((req, res, next) => {
  res.locals.url_root = cfg.url_root;
  res.locals.main_menu_entries = menu_entries.main;
  next();
});

app.use('/', rt_web_ui);
app.use('/', rt_web_api);
app.use('/api', rt_json_api);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(500);
  res.render('error');
});

export default app;
