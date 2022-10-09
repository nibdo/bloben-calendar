import { AxiosResponse } from 'axios';

import {
  CommonResponse,
  EnableTwoFactorRequest,
  GetTwoFactorSecretResponse,
  LoginWithTwoFactorAdminResponse,
  LoginWithTwoFactorRequest,
} from '../bloben-interface';

import { APP_API_VERSION_1 } from '../types/constants';
import Axios, { config } from '../lib/Axios';

const V1_BASE_PATH = `/app${APP_API_VERSION_1}/auth/two-factor`;

const TwoFactorAuthApi = {
  loginWith2FA: async (
    data: LoginWithTwoFactorRequest
  ): Promise<AxiosResponse<LoginWithTwoFactorAdminResponse>> => {
    return Axios.post(`${V1_BASE_PATH}/login`, data, config);
  },
  generate2FA: async (): Promise<AxiosResponse<GetTwoFactorSecretResponse>> => {
    return Axios.post(`${V1_BASE_PATH}`, {});
  },
  delete2FA: async (): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`${V1_BASE_PATH}`, {});
  },
  enable2FA: async (
    data: EnableTwoFactorRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`${V1_BASE_PATH}/enable`, data);
  },
};

export default TwoFactorAuthApi;
