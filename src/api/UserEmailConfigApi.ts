import { AxiosResponse } from 'axios';
import {
  CommonResponse,
  GetUserEmailConfigResponse,
  UpdateUserEmailConfigRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  update: async (
    data: UpdateUserEmailConfigRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch('/app/v1/users/email-config', data);
  },
  get: async (): Promise<AxiosResponse<GetUserEmailConfigResponse>> => {
    return Axios.get('/app/v1/users/email-config');
  },
  delete: async (): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete('/app/v1/users/email-config');
  },
};
