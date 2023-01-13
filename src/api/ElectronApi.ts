import { AxiosResponse } from 'axios';
import { CommonResponse } from 'bloben-interface';
import { CreateElectronUserRequest } from 'bloben-interface';
import Axios from '../lib/Axios';

export default {
  createUser: async (
    data: CreateElectronUserRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post('/electron/v1/users', data);
  },
  deleteUser: async (): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete('/electron/v1/users');
  },
  ping: async (): Promise<AxiosResponse<any>> => {
    return Axios.get('/electron/v1/users/ping');
  },
};
