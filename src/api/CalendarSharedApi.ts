import { AxiosResponse } from 'axios';

import { CommonResponse } from '../bloben-interface/interface';
import {
  GetSharedCalendarResponse,
  GetSharedCalendarsResponse,
  PostSendSharedCalendarInviteRequest,
  PostSharedLinkRequest,
} from '../bloben-interface/calendar/shared/calendarShared';
import Axios from 'lib/Axios';

export default {
  postSharedCalendar: async (
    data: PostSharedLinkRequest
  ): Promise<AxiosResponse<any>> => {
    return Axios.post(`/v1/calendars/shared`, data);
  },
  getSharedCalendars: async (): Promise<
    AxiosResponse<GetSharedCalendarsResponse[]>
  > => {
    return Axios.get(`/v1/calendars/shared`);
  },
  getSharedCalendar: async (
    id: string
  ): Promise<AxiosResponse<GetSharedCalendarResponse>> => {
    return Axios.get(`/v1/calendars/shared/${id}`);
  },
  updateSharedCalendar: async (
    id: string,
    data: PostSharedLinkRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put(`/v1/calendars/shared/${id}`, data);
  },
  patchSharedCalendar: async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch(`/v1/calendars/shared/${id}`);
  },
  deleteSharedCalendar: async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/v1/calendars/shared/${id}`);
  },
  postInvite: async (
    data: PostSendSharedCalendarInviteRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/v1/calendars/shared/invite`, data);
  },
};