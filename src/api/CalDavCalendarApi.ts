import { AxiosResponse } from 'axios';
import {
  CommonResponse,
  CreateCalDavCalendarRequest,
  GetCalDavCalendar,
  PatchCalDavCalendarRequest,
  UpdateCalDavCalendarRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  getCalDavCalendars: async (): Promise<AxiosResponse<GetCalDavCalendar[]>> => {
    return Axios.get(`/app/v1/caldav-calendars?component=VEVENT`);
  },
  syncCalDavCalendars: async (): Promise<AxiosResponse<void>> => {
    return Axios.post(`/app/v1/caldav-calendars/sync`);
  },
  createCalendar: async (
    data: CreateCalDavCalendarRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/app/v1/caldav-calendars`, data);
  },
  updateCalendar: async (
    id: string,
    data: UpdateCalDavCalendarRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put(`/app/v1/caldav-calendars/${id}`, data);
  },
  patchCalendar: async (
    id: string,
    data: PatchCalDavCalendarRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch(`/app/v1/caldav-calendars/${id}`, data);
  },
  deleteCalendar: async (
    id: string
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/caldav-calendars/${id}`);
  },
};
