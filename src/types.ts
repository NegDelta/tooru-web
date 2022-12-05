export interface PageUserEditableFields {
  title: string;
  lead: string;
  body: string;
}

export interface Page extends PageUserEditableFields {
  id: string;
  time: string;
  edit_time: string;
}

export type SqlSelectPagesResponse = {
  id: string;
  time: string;
  edit_time: string;
  title: string;
  lead: string;
  body: string;
}[];

export type SqlResponseCallback<T> = (dbres: T) => void;
