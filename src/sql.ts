import mariadb from 'mariadb';
import createDebug from 'debug';
import { UpsertResult } from 'mariadb';
import { cfg } from './logic';
import { QueryParametersList, SqlSelectDupesResult, SqlSelectPagesResult } from './types';

createDebug.enable('tooru:*');
const debug = createDebug('tooru:sql');

const pool = mariadb.createPool(cfg.dbpool);

const queryAndDebug =
  <S extends QueryParametersList, T>(sql: string) =>
  async (...args: S) => {
    debug('connecting to sql');
    const dbConnection = await pool.getConnection();
    debug('connected, id:', dbConnection.threadId);

    const response: T = await dbConnection.query(sql, args);
    debug(`got response, id: ${dbConnection.threadId}, length: ${JSON.stringify(response).length}`);

    dbConnection.end();
    return response;
  };

const getSortedAllPages = queryAndDebug<[], SqlSelectPagesResult>('SELECT * FROM pages ORDER BY time DESC;');

const getPagesById = queryAndDebug<[pageId: string], SqlSelectPagesResult>('SELECT * FROM pages WHERE id=?;');

const getPagesByTime = queryAndDebug<[time: number], SqlSelectDupesResult>(
  'SELECT COUNT(1) AS dupes FROM pages WHERE time=?;'
);

const addPage = queryAndDebug<
  [id: string, time: number, edit_time: number, title: string, lead: string, body: string],
  UpsertResult
>('INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?);');

const updatePage = queryAndDebug<[time: number, title: string, lead: string, body: string, id: string], UpsertResult>(
  'UPDATE pages SET edit_time=?, title=?, lead=?, body=? WHERE id=?;'
);

const deletePage = queryAndDebug<[id: string], UpsertResult>('DELETE FROM pages WHERE id=?;');

export default {
  getSortedAllPages,
  getPagesById,
  getPagesByTime,
  addPage,
  updatePage,
  deletePage
};
