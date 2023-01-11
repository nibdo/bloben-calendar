import { generateRandomSimpleString, isDev } from '../utils/common';
import axios from 'axios';

const headers: any = {
  credentials: 'same-origin',
  'Content-Type': 'application/json',
  withCredentials: true,
};

export const config: any = {
  timeout: 20000,
  headers,
  withCredentials: true,
};

if (isDev()) {
  if (generateRandomSimpleString) {
    headers['X-Real-IP'] = generateRandomSimpleString();
  }
}

const getBaseUrl = () => window.env.apiUrl;

// @ts-ignore
import { IpcClient } from 'ipc-express-fork';
import { isElectron } from '../env';
// @ts-ignore
const ipcRenderer = window.ipcRenderer;
const ipc = new IpcClient(ipcRenderer);

const client = isElectron ? ipc : axios;

const Axios: any = {
  getRaw: async (path: string) => {
    if (isElectron) {
      return client.get(path);
    }
    return axios.get(path);
  },
  get: async (path: string) => {
    const URL: string = getBaseUrl() + path;
    if (isElectron) {
      return client.get(URL);
    }
    return axios.get(URL, config);
  },
  getJSON: async (path: string) => {
    const URL: string = getBaseUrl() + path;

    let response: any;
    if (isElectron) {
      response = await client.get(URL);
    } else {
      response = await axios.get(URL, config);
    }

    return response.json();
  },
  post: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;
    if (isElectron) {
      return client.post(URL, data);
    }

    return axios.post(URL, data, config);
  },
  patch: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;

    if (isElectron) {
      return client.patch(URL, data);
    }

    return axios.patch(URL, data, config);
  },
  put: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;

    if (isElectron) {
      return client.put(URL, data);
    }

    return axios.put(URL, data, config);
  },
  delete: async (path: string, data: any) => {
    const URL: string = getBaseUrl() + path;

    if (isElectron) {
      return client.delete(URL, data);
    }

    return axios.delete(URL, { ...config, data });
  },
};

export default Axios;
