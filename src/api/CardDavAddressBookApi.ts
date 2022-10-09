import { AxiosResponse } from 'axios';

import { GetCardDavAddressBooks } from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  getAll: async (): Promise<AxiosResponse<GetCardDavAddressBooks[]>> => {
    return Axios.get(`/app/v1/carddav/address-books`);
  },
};
