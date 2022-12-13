import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import rt_web_ui from './routes/web_ui';
import rt_web_api from './routes/web_api';
import rt_json_api from './routes/json_api';
import { cfg } from './globals';

// wrapper to take care to the base url problem
const app_wrap = express();
const app = express();
app_wrap.use(cfg.appRoot, app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// always send url_root to renderer
app.use((req, res, next) => {
  res.locals.url_root = cfg.appRoot;
  next();
});

app.use('/web', rt_web_ui);
app.use('/web', rt_web_api);
app.use('/', rt_json_api);

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
  res.send('error');
});

export default app;
