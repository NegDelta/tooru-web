// These endpoints are to be called from the web UI forms.
import multer from 'multer';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { addPage, cfg, deletePage, find_pages, updatePage } from '../logic';
import createDebug from 'debug';
import { PageUserEditableFields } from '../types';

createDebug.enable('tooru:*');
const debug = createDebug('tooru:webapi');

const storage = multer.memoryStorage();
const mw_upload = multer({ storage });

const setupRouter = () => {
  const router = express.Router();

  router.post('/pages/new/', async (req: Request, res: Response, _next: NextFunction) => {
    debug(req.body);
    const pageFields: PageUserEditableFields = req.body;

    const newId = await addPage(pageFields);

    res.redirect(path.posix.join(cfg.url_root, '/pages/', newId, '/'));
  });

  router.post('/pages/:id([\\d-]+)/update/', async (req: Request, res: Response, _next: NextFunction) => {
    debug(req.body);
    const pageFields: PageUserEditableFields = req.body;

    await updatePage(req.params.id, pageFields);

    res.redirect(path.posix.join(cfg.url_root, '/pages/', req.params.id, '/'));
  });

  router.post('/pages/:id([\\d-]+)/delete/', async (req: Request, res: Response, _next: NextFunction) => {
    debug(req.body);
    const id = req.params.id;

    await deletePage(id);

    res.redirect(cfg.url_root);
  });

  router.post('/upload/', mw_upload.single('uploadfile'), (req: Request, res: Response, _next: NextFunction) => {
    const uploadedContent = req.file?.buffer.toString();

    const pagesParsedFromFile = find_pages(uploadedContent);

    res.render('uploadresult', {
      found_pages: pagesParsedFromFile,
      page_filename: req.file?.originalname
    });
  });

  return router;
};

export default setupRouter();
