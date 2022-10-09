import {
  CommonResponse,
  GetSessionResponse,
  LoginRequest,
  LoginResponse,
} from '../bloben-interface';
import Axios, { config } from '../lib/Axios';
import axios, { AxiosResponse } from 'axios';

export default {
  login: async (
    url: string,
    data: LoginRequest
  ): Promise<AxiosResponse<LoginResponse>> => {
    return axios.post(`${url}/app/v1/auth/login`, data, config);
  },
  getSession: async (): Promise<AxiosResponse<GetSessionResponse>> => {
    return Axios.get('/app/v1/auth/login');
  },
  logout: async (): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.get('/app/v1/auth/logout');
  },
};
