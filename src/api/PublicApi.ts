import { AxiosResponse } from 'axios';

import {
  GetSharedLinkPublicResponse,
  SearchEventsResponse,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  getPublicCalendars: async (id: string): Promise<AxiosResponse<any>> => {
    return Axios.get(`/v1/public/calendars/${id}/calendars`);
  },
  getPublicEvents: async (
    id: string,
    rangeFrom: string,
    rangeTo: string
  ): Promise<AxiosResponse<any>> => {
    return Axios.get(
      `/v1/public/calendars/${id}/events?rangeFrom=${rangeFrom}&rangeTo=${rangeTo}`
    );
  },
  searchPublicEvents: async (
    id: string,
    summary: string
  ): Promise<AxiosResponse<SearchEventsResponse[]>> => {
    return Axios.get(`/v1/public/calendars/${id}/search?summary=${summary}`);
  },
  getPublicSharedLink: async (
    id: string
  ): Promise<AxiosResponse<GetSharedLinkPublicResponse>> => {
    return Axios.get(`/v1/public/calendars/${id}`);
  },
};
