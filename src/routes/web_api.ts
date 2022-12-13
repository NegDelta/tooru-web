// These endpoints are to be called from the web UI forms.
import path from 'path';
import createDebug from 'debug';
import multer from 'multer';
import { NextFunction, Request, Response, Router } from 'express';
import restApi from '../rest';
import { PageUserEditableFields } from '../types';
import { cfg } from '../globals';

createDebug.enable('tooru:*');
const debug = createDebug('tooru:webapi');

const storage = multer.memoryStorage();
const mw_upload = multer({ storage });

const setupRouter = () => {
  const router = Router();

  router.post('/pages/new/', async (req: Request, res: Response, _next: NextFunction) => {
    debug(req.body);
    const pageFields: PageUserEditableFields = req.body;

    const newId = await restApi.postNewPage(pageFields);

    res.redirect(path.posix.join(cfg.path.web, '/pages/', newId, '/'));
  });

  router.post('/pages/:id([\\d-]+)/update/', async (req: Request, res: Response, _next: NextFunction) => {
    debug(req.body);
    const pageFields: PageUserEditableFields = req.body;

    await restApi.putPage(req.params.id, pageFields);

    res.redirect(path.posix.join(cfg.path.web, '/pages/', req.params.id, '/'));
  });

  router.post('/pages/:id([\\d-]+)/delete/', async (req: Request, res: Response, _next: NextFunction) => {
    debug(req.body);
    const id = req.params.id;

    await restApi.deletePage(id);

    res.redirect(cfg.path.web);
  });

  router.post('/upload/', mw_upload.single('uploadfile'), (req: Request, res: Response, _next: NextFunction) => {
    const uploadedContent = req.file?.buffer.toString();

    const pagesParsedFromFile = restApi.postParse(uploadedContent);

    res.render('uploadresult', {
      found_pages: pagesParsedFromFile,
      page_filename: req.file?.originalname
    });
  });

  return router;
};

export default setupRouter();
