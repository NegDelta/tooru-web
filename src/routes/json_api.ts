// These endpoints are to be called directly, and do not return pages.

import express, { NextFunction, Response } from 'express';
import path from 'path';
import { Request } from 'express';
import {
  cfg,
  prom_deletePage,
  prom_getAllPages,
  prom_getPage,
  prom_postPage,
  prom_updatePage,
  timetoid
} from '../logic';

const set_dl = (req: Request<unknown, unknown, unknown, { dl?: string }>, res: Response, filename: string) => {
  if ((req.query.dl || '') === '1') {
    res.set('Content-disposition', 'attachment; filename="' + filename + '.json"');
  }
};

const setupRouter = () => {
  const router = express.Router();

  router.post('/dummy/', (req: Request, res: Response, _next: NextFunction) => {
    res.json(req.body);
  });

  router.get('/timetoid/', (req: Request, res: Response, _next: NextFunction) => {
    res.redirect('./0');
  });

  router.get('/timetoid/:dupes/', (req: Request, res: Response, _next: NextFunction) => {
    const ids = timetoid(Date.now().valueOf(), Number(req.params.dupes));
    res.json(ids.output);
  });

  // GET all pages
  router.get('/pages/', (req: Request, res: Response, _next: NextFunction) => {
    prom_getAllPages(res, (dbres) => {
      set_dl(req, res, 'tooru-pages');
      res.json(dbres);
    });
  });

  // POST new page
  router.post('/pages/new/', (req: Request, res: Response, _next: NextFunction) => {
    const timeint = Date.now().valueOf();
    prom_postPage(res, timeint, req.body, (dbres) => {
      console.log(dbres);
      // HTTP 201 Created, with new page url in Location header
      const new_page_url = path.posix.join(cfg.url_root, '/api/pages/', dbres.insertId.toString(), '/');
      res.status(201).set('Location', new_page_url).end();
    });
  });

  // GET, PUT (edit), DELETE a given page
  router
    .route('/pages/:id([\\d-]+)/')
    .all((req: Request, res: Response, next: NextFunction) => {
      // catch-all for all verbs
      next();
    })
    .get((req: Request, res: Response, _next: NextFunction) => {
      prom_getPage(res, req.params.id, (dbres) => {
        if (dbres.length == 0) {
          res.status(404).end();
          return;
        }
        const page = dbres[0];
        set_dl(req, res, req.params.id);
        res.json(page);
      });
    })
    .put((req: Request, res: Response, _next: NextFunction) => {
      const timeint = Date.now().valueOf();
      console.log(req.body);
      prom_updatePage(res, timeint, req.body, req.params.id, (dbres) => {
        console.log(dbres);
        // HTTP 204 No Content
        res.status(204).end();
      });
    })
    .delete((req: Request, res: Response, _next: NextFunction) => {
      prom_deletePage(res, req.params.id, (dbres) => {
        console.log(dbres);
        // HTTP 204 No Content
        res.status(204).end();
      });
    });

  return router;
};

export default setupRouter();
