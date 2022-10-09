import { AxiosResponse } from 'axios';
import {
  CalDavTask,
  CommonResponse,
  CreateCalDavEventRequest,
  DeleteCalDavEventRequest,
  UpdateCalDavEventRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  getTasks: async (): Promise<AxiosResponse<CalDavTask[]>> => {
    return Axios.get(`/app/v1/caldav-tasks`);
  },
  sync: async (): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.get(`/app/v1/caldav-tasks/sync`);
  },
  create: async (
    data: CreateCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post('/app/v1/caldav-tasks', data);
  },
  update: async (
    data: UpdateCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put('/app/v1/caldav-tasks', data);
  },
  delete: async (
    data: DeleteCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/caldav-tasks`, data);
  },
};
