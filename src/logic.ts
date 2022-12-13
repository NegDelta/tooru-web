import createDebug from 'debug';
import sqlApi from './sql';
import { Page, PageUserEditableFields } from './types';

createDebug.enable('tooru:*');
const _debug = createDebug('tooru:logic');

export const createId = (timeint: number, dupecount: number) => {
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
  const triplets = [] as string[];

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

export const updatePage = async (pageId: string, { title, lead, body }: PageUserEditableFields) => {
  const timeCreated = Date.now().valueOf();

  await sqlApi.updatePage(timeCreated, title, lead, body, pageId);
};

export const addPage = async ({ title, lead, body }: PageUserEditableFields) => {
  const timeCreated = Date.now().valueOf();
  const dupesResponse = await sqlApi.getPagesByTime(timeCreated);
  const dupesCount = Number(dupesResponse[0].dupes);
  const newId = createId(timeCreated, dupesCount);
  await sqlApi.addPage(newId.output.string, timeCreated, timeCreated, title, lead, body);
  return newId.output.string;
};

export const deletePage = async (pageId: string) => await sqlApi.deletePage(pageId);

export const getPage = async (pageId: string) => {
  const pageResponse = await sqlApi.getPagesById(pageId);
  if (pageResponse.length !== 1) {
    return;
  }
  return pageResponse[0] as Page;
};

export const getAllPages = async () => (await sqlApi.getSortedAllPages()) as Page[];

export const findPages = (_content = '') => {
  const pages = [] as Page[];
  return pages;
};
