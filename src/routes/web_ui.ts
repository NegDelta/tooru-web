// These endpoints are to be called directly from the user or web UI links, and return pages. These should be idempotent.

import express from 'express';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import { cfg, menu_entries, prom_getAllPages, prom_getPage, time_fmt } from '../logic';
import { Page } from '../types';
import createDebug from 'debug';

createDebug.enable('tooru:*');
const _debug = createDebug('tooru:webui');

const setupRouter = () => {
  const router = express.Router();

  const add_fmtted_time = (page: Page) => {
    const fmt_page = {
      ...page,
      rendered_time: time_fmt(page.time),
      rendered_edit_time: time_fmt(page.edit_time)
    };
    return fmt_page;
  };

  const rtcb_getAllPages = (_req: Request, res: Response, _next: NextFunction) => {
    // all pages
    prom_getAllPages(res, (dbres) => {
      dbres.forEach(add_fmtted_time);
      res.render('allpages', {
        pages: dbres,
        pagetype_menu_entries: menu_entries.pagecoll_sub
      });
    });
  };

  router.get('/', rtcb_getAllPages);
  router.get('/pages/', rtcb_getAllPages);

  router.get('/pages/new/', (_req, res, _next) => {
    res.render('newpage', {
      page: {},
      title: 'new page',
      target: 'pages/new'
    });
  });

  const rt_page = express.Router();

  rt_page.get('/', (_req, res, next) => {
    prom_getPage(res, res.locals.pageid, (dbres) => {
      if (dbres.length == 0) {
        next('route'); // pass out into 404 middleware
        return;
      }
      const page = dbres[0];
      const fmt_page = add_fmtted_time(page);
      res.render('onepage', {
        page: fmt_page,
        pagetype_menu_entries: [
          { text: 'edit', path: path.posix.join('pages/', res.locals.pageid, 'edit/') },
          { text: 'delete', path: path.posix.join('pages/', res.locals.pageid, 'delete/') },
          { text: 'download', path: path.posix.join('api/pages/', res.locals.pageid, '?dl=1') }
        ]
      });
    });
  });

  rt_page.get('/edit/', (_req, res, _next) => {
    prom_getPage(res, res.locals.pageid, (dbres) => {
      const page = dbres[0];
      const fmt_page = add_fmtted_time(page);
      res.render('newpage', {
        page: fmt_page,
        title: 'edit page',
        target: path.posix.join('pages', res.locals.pageid, 'update')
      });
    });
  });

  rt_page.get('/delete/', (_req, res, _next) => {
    prom_getPage(res, res.locals.pageid, (dbres) => {
      const page = dbres[0];
      res.render('deletepage', { page });
    });
  });

  router.use(
    '/pages/:id([\\d-]+)/',
    (req, res, next) => {
      res.locals.pageid = req.params.id;
      next();
    },
    rt_page
  );

  router.get('/admin/', (_req, res, _next) => {
    res.render('adminindex', {
      cfgjson: JSON.stringify(cfg)
    });
  });

  router.get('/upload/', (_req, res, _next) => {
    res.render('uploadpages', {
      //
    });
  });

  return router;
};

export default setupRouter();
