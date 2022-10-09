import { AxiosResponse } from 'axios';
import {
  CommonResponse,
  CreateWebcalCalendarRequest,
  GetWebcalCalendarsResponse,
  PatchWebcalCalendarRequest,
} from '../bloben-interface';

import Axios from '../lib/Axios';

export default {
  createWebcalCalendar: async (
    data: CreateWebcalCalendarRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/app/v1/webcal/calendars`, data);
  },
  updateWebcalCalendar: async (
    id: string,
    data: CreateWebcalCalendarRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put(`/app/v1/webcal/calendars/${id}`, data);
  },
  getWebcalCalendars: async (): Promise<
    AxiosResponse<GetWebcalCalendarsResponse[]>
  > => {
    return Axios.get('/app/v1/webcal/calendars');
  },
  patchCalendar: async (
    id: string,
    data: PatchWebcalCalendarRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch(`/app/v1/webcal/calendars/${id}`, data);
  },
  deleteWebcalCalendar: async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/webcal/calendars/${id}`);
  },
};
