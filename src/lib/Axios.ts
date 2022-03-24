import { generateRandomSimpleString } from '../utils/common';
import axios from 'axios';

const headers: any = {
  credentials: 'same-origin',
  'Content-Type': 'application/json',
  withCredentials: true,
};

export const config: any = {
  timeout: 5000,
  headers,
  withCredentials: true,
};

if (process.env.REACT_APP_NODE_ENV === 'development') {
  if (generateRandomSimpleString) {
    headers['X-Real-IP'] = generateRandomSimpleString();
  }
}

const getBaseUrl = () => window.env.apiUrl;

const Axios: any = {
  getRaw: async (path: string) => {
    return axios.get(path);
  },
  get: async (path: string) => {
    const URL: string = getBaseUrl() + path;
    return axios.get(URL, config);
  },
  getJSON: async (path: string) => {
    const URL: string = getBaseUrl() + path;
    const response: any = await axios.get(URL, config);

    return response.json();
  },
  post: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;
    return axios.post(URL, data, config);
  },
  patch: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;
    return axios.patch(URL, data, config);
  },
  put: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;
    return axios.put(URL, data, config);
  },
  delete: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;
    return axios.delete(URL, { ...config, data });
  },
};

export default Axios;
