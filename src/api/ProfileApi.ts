import { AxiosResponse } from 'axios';
import {
  CommonResponse,
  GetProfileResponse,
  PatchProfileRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  getProfile: async (): Promise<AxiosResponse<GetProfileResponse>> => {
    return Axios.get('/app/v1/profile');
  },
  patchProfile: async (
    data: PatchProfileRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch('/app/v1/profile', data);
  },
};
