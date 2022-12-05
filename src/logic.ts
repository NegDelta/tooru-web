import { Response } from 'express';
import mariadb, { PoolConnection, UpsertResult } from 'mariadb';
import nconf from 'nconf';
import { Page, PageUserEditableFields, SqlResponseCallback, SqlSelectPagesResponse } from './types';
import createDebug from 'debug';

createDebug.enable('tooru:*');
const debug = createDebug('tooru:logic');

nconf.argv().env().file({ file: 'config.json' });

export const cfg = nconf.get();
export const mdb_pool = mariadb.createPool(cfg.dbpool);

export const timetoid = (timeint: number, dupecount: number) => {
  const timestr_nosuffix = timeint.toString();
  const timestr_dupes = timestr_nosuffix + dupecount.toString();
  const timestr_dupes_exploded = timestr_dupes.toString().split('');

  // compute hash digit
  const combinationmap = [1, 3, 7, 9];
  let hashdig = 0;
  timestr_dupes_exploded.forEach((inum, iindex) => {
    hashdig += Number(inum) * combinationmap[iindex % 4];
  });
  hashdig %= 10;

  const idint = timeint * 10 + hashdig;
  const timestr_hash = idint.toString();
  const triplets = [];

  triplets.push(timestr_hash.slice(-3));
  triplets.push(timestr_hash.slice(-6, -3));
  triplets.push(timestr_hash.slice(-9, -6));
  triplets.push(timestr_hash.slice(undefined, -9));

  const idstring = triplets.join('-');

  return {
    input: {
      time: timeint,
      dupecount: dupecount
    },
    intermediate: {
      checksum: hashdig
    },
    output: {
      int: idint,
      array: triplets,
      string: idstring
    }
  };
};

const prom_dbConnection = (httpres: Response, conn_prom: (conn: PoolConnection) => Promise<PoolConnection>) => {
  // conn_prom must take connection and resolve returning connection
  const prom_report_success = (conn: PoolConnection) => {
    debug('Established DB connection:', conn.threadId);
    return conn;
  };

  const handle_connection = (conn: PoolConnection) => {
    return conn_prom(conn)
      .then((conn) => {
        debug('Ending DB connection:' + conn.threadId);
        conn.end();
      })
      .catch((err: Error) => {
        debug('Error in DB connection', err);
        conn.end();
      });
  };

  return mdb_pool
    .getConnection()
    .then(prom_report_success)
    .then(handle_connection)
    .catch((err) => {
      debug('Cannot connect to database:', err);
      httpres.send('Cannot connect to database'); // TODO: render
    });
};

export const time_fmt = (timestr: string) => new Date(Number(timestr)).toDateString();

export const prom_updatePage = (
  httpres: Response,
  timeint: number,
  reqparams: PageUserEditableFields,
  pageid: string,
  dbres_cb: SqlResponseCallback<UpsertResult>
) => {
  return prom_dbConnection(httpres, (dbconn) =>
    dbconn
      .query('UPDATE pages SET edit_time=?, title=?, lead=?, body=? WHERE id=?', [
        timeint,
        reqparams.title,
        reqparams.lead,
        reqparams.body,
        pageid
      ])
      .then(dbres_cb)
      .then(() => dbconn)
  );
};

export const prom_postPage = (
  httpres: Response,
  timeint: number,
  reqparams: PageUserEditableFields,
  dbres_cb: SqlResponseCallback<UpsertResult>
) => {
  return prom_dbConnection(httpres, (dbconn) =>
    dbconn
      .query('SELECT COUNT(1) AS dupes FROM pages WHERE time=?;', timeint)
      .then((dbres) => {
        const ids = timetoid(timeint, Number(dbres[0].dupes));
        return dbconn.query('INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?) RETURNING id', [
          ids.output.string,
          timeint,
          timeint,
          reqparams.title,
          reqparams.lead,
          reqparams.body
        ]);
      })
      .then(dbres_cb)
      .then(() => dbconn)
  );
};

export const prom_deletePage = (httpres: Response, pageid: string, dbres_cb: SqlResponseCallback<UpsertResult>) => {
  return prom_dbConnection(httpres, (dbconn) =>
    dbconn
      .query('DELETE FROM pages WHERE id=?;', pageid)
      .then(dbres_cb)
      .then(() => dbconn)
  );
};

export const prom_getPage = (
  httpres: Response,
  pageid: string,
  dbres_cb: SqlResponseCallback<SqlSelectPagesResponse>
) => {
  return prom_dbConnection(httpres, (dbconn) =>
    dbconn
      .query('SELECT * FROM pages WHERE id=?;', pageid)
      .then(dbres_cb)
      .then(() => dbconn)
  );
};

export const prom_getAllPages = (httpres: Response, dbres_cb: SqlResponseCallback<SqlSelectPagesResponse>) => {
  return prom_dbConnection(httpres, (dbconn) =>
    dbconn
      .query('SELECT * FROM pages ORDER BY time DESC;')
      .then(dbres_cb)
      .catch((err) => {
        debug('Error on query:', err);
      })
      .then(() => dbconn)
  );
};

export const find_pages = (_content: string) => {
  const pages = [] as Page[];
  return pages;
};

export const menu_entries = {
  main: [
    { text: 'all pages', path: '.' },
    { text: 'new page', path: 'pages/new/' },
    { text: 'upload', path: 'upload/' },
    { text: 'admin', path: 'admin/' }
  ],
  pagecoll_sub: [{ text: 'download', path: 'api/pages?dl=1' }]
};
