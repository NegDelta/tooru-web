// These endpoints are to be called directly from the user or web UI links, and return pages. These should be idempotent.

import express, { RequestHandler } from 'express';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import { cfg, getAllPages, getPage, menu_entries, prettyTrim, time_fmt } from '../logic';
import { Page, PageRenderProps } from '../types';
import createDebug from 'debug';

createDebug.enable('tooru:*');
const debug = createDebug('tooru:webui');

const renderTime = (page: Page) =>
  ({
    ...page,
    rendered_time: time_fmt(page.time),
    rendered_edit_time: time_fmt(page.edit_time)
  } as PageRenderProps);

const setupRouter = () => {
  const router = express.Router();

  const handleErrors = (routeCallback: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routeCallback(req, res, next);
    } catch (e) {
      // render error
      const rawError = JSON.stringify(e);
      const trimmedError = prettyTrim(rawError);
      debug(`received error: ${trimmedError}`);
      res.send(`Error: ${rawError}`);
    }
  };

  const rtcb_getAllPages = async (_req: Request, res: Response, _next: NextFunction) => {
    const pages = await getAllPages();

    res.render('allpages', {
      pages,
      pagetype_menu_entries: menu_entries.pagecoll_sub
    });
  };

  router.get('/', handleErrors(rtcb_getAllPages));
  router.get('/pages/', handleErrors(rtcb_getAllPages));

  router.get('/pages/new/', (req, res) => {
    res.render('newpage', {
      page: {},
      title: 'new page',
      target: 'pages/new'
    });
  });

  const rt_page = express.Router();

  rt_page.get('/', async (req, res) => {
    const { page, pagetype_menu_entries } = res.locals;
    res.render('onepage', { page, pagetype_menu_entries });
  });

  rt_page.get('/edit/', (req, res) => {
    const { page } = res.locals;

    res.render('newpage', { page, title: 'edit page', target: path.posix.join('pages', page.id, 'update') });
  });

  rt_page.get('/delete/', (_req, res, _next) => {
    const { page } = res.locals;

    res.render('deletepage', { page });
  });

  router.use(
    '/pages/:id([\\d-]+)/',
    async (req, res, next) => {
      const id = req.params.id;

      const page = await getPage(id);
      debug('got page:', page);
      if (!page) {
        next('route'); // pass out into 404 middleware
        return;
      }

      const pageProps = renderTime(page);
      res.locals.page = pageProps;
      res.locals.pagetype_menu_entries = [
        { text: 'edit', path: path.posix.join('pages/', page.id, 'edit/') },
        { text: 'delete', path: path.posix.join('pages/', page.id, 'delete/') },
        { text: 'download', path: path.posix.join('api/pages/', page.id, '?dl=1') }
      ];
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
