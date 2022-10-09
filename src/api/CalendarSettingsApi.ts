import { AxiosResponse } from 'axios';
import {
  CalendarSettingsResponse,
  CommonResponse,
  PatchCalendarSettingsRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  patch: async (
    data: PatchCalendarSettingsRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch('/app/v1/calendar-settings', data);
  },
  get: async (): Promise<AxiosResponse<CalendarSettingsResponse>> => {
    return Axios.get('/app/v1/calendar-settings');
  },
};
