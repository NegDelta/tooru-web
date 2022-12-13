import axios from 'axios';
import { cfg } from './globals';
import { PageUserEditableFields } from './types';

const axiosInstance = axios.create({
  baseURL: cfg.restRoot,
  timeout: 1000
});

const getPages = async () => {
  return (await axiosInstance.get('pages/')).data;
};

const postNewPage = async (pageData: PageUserEditableFields) => {
  return (await axiosInstance.post('pages/new/', pageData)).data;
};

const getPage = async (id: string) => {
  return (await axiosInstance.get(`pages/${id}/`)).data;
};

const putPage = async (id: string, pageData: PageUserEditableFields) => {
  return (await axiosInstance.put(`pages/${id}/`, pageData)).data;
};

const deletePage = async (id: string) => {
  return (await axiosInstance.delete(`pages/${id}/`)).data;
};

const postParse = async (dump?: string) => {
  return (await axiosInstance.post('parse/', dump)).data;
};

export default {
  getPages,
  postNewPage,
  getPage,
  putPage,
  deletePage,
  postParse
};
