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

export interface PageRenderProps extends Page {
  rendered_time: string;
  rendered_edit_time: string;
}
