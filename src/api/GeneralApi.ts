import { AxiosResponse } from 'axios';
import { GetServerSettingsUser, GetVersion } from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  getApiVersion: async (): Promise<AxiosResponse<GetVersion>> => {
    return Axios.get('/app/v1/version');
  },
  getSync: async (): Promise<AxiosResponse<any>> => {
    return Axios.get('/app/v1/sync');
  },
  getServerSettings: async (): Promise<
    AxiosResponse<GetServerSettingsUser>
  > => {
    return Axios.get('/app/v1/server-settings/user');
  },
};
