import { AxiosResponse } from 'axios';

import {
  CommonResponse,
  GetSharedCalendarResponse,
  GetSharedCalendarsResponse,
  PostSendSharedCalendarInviteRequest,
  PostSharedLinkRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  postSharedCalendar: async (
    data: PostSharedLinkRequest
  ): Promise<AxiosResponse<any>> => {
    return Axios.post(`/app/v1/calendars/shared`, data);
  },
  getSharedCalendars: async (): Promise<
    AxiosResponse<GetSharedCalendarsResponse[]>
  > => {
    return Axios.get(`/app/v1/calendars/shared`);
  },
  getSharedCalendar: async (
    id: string
  ): Promise<AxiosResponse<GetSharedCalendarResponse>> => {
    return Axios.get(`/app/v1/calendars/shared/${id}`);
  },
  updateSharedCalendar: async (
    id: string,
    data: PostSharedLinkRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put(`/app/v1/calendars/shared/${id}`, data);
  },
  patchSharedCalendar: async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch(`/app/v1/calendars/shared/${id}`);
  },
  deleteSharedCalendar: async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/calendars/shared/${id}`);
  },
  postInvite: async (
    id: string,
    data: PostSendSharedCalendarInviteRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/app/v1/calendars/shared/${id}/invite`, data);
  },
};
