// These endpoints are to be called from the web UI forms.
import multer from 'multer';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { cfg, find_pages, prom_deletePage, prom_postPage, prom_updatePage } from '../logic';

const storage = multer.memoryStorage();
const mw_upload = multer({ storage: storage });

const setupRouter = () => {
  const router = express.Router();

  router.post('/pages/new/', (req: Request, res: Response, _next: NextFunction) => {
    const timeint = Date.now().valueOf();
    prom_postPage(res, timeint, req.body, (dbres) => {
      console.log(dbres);
      res.redirect(path.posix.join(cfg.url_root, '/pages/', dbres.insertId.toString(), '/'));
    });
  });

  router.post('/pages/:id([\\d-]+)/update/', (req: Request, res: Response, _next: NextFunction) => {
    const timeint = Date.now().valueOf();
    console.log(req.body);
    prom_updatePage(res, timeint, req.body, req.params.id, (dbres) => {
      console.log(dbres);
      res.redirect(path.posix.join(cfg.url_root, '/pages/', req.params.id, '/'));
    });
  });

  router.post('/pages/:id([\\d-]+)/delete/', (req: Request, res: Response, _next: NextFunction) => {
    prom_deletePage(res, req.params.id, (dbres) => {
      console.log(dbres);
      res.redirect(cfg.url_root);
    });
  });

  router.post('/upload/', mw_upload.single('uploadfile'), (req: Request, res: Response, _next: NextFunction) => {
    const uploaded_content = req.file?.buffer.toString() || '';
    const found_pages = find_pages(uploaded_content);
    res.render('uploadresult', {
      found_pages: found_pages,
      page_filename: req.file?.originalname
    });
  });

  return router;
};

export default setupRouter();
