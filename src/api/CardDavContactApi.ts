import { AxiosResponse } from 'axios';

import {
  CommonResponse,
  CreateCardDavContactRequest,
  GetCardDavContactsResponse,
  SearchCardDavContactResponse,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  search: async (
    text: string
  ): Promise<AxiosResponse<SearchCardDavContactResponse>> => {
    return Axios.get(`/app/v1/carddav/contacts/search?text=${text}`);
  },
  getAll: async (
    addressBookID: string
  ): Promise<AxiosResponse<GetCardDavContactsResponse[]>> => {
    return Axios.get(`/app/v1/carddav/contacts?addressBookID=${addressBookID}`);
  },
  delete: async (id: string): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/carddav/contacts/${id}`);
  },
  create: async (
    data: CreateCardDavContactRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/app/v1/carddav/contacts`, data);
  },
};
