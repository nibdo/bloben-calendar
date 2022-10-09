import { DAV_ACCOUNT_TYPE } from '../enums';

export interface CreateCalDavAccountRequest {
  username: string;
  password: string;
  url: string;
  accountType: DAV_ACCOUNT_TYPE;
}

export interface UpdateCalDavAccountRequest {
  password: string;
}

export interface GetCalDavAccountResponse {
  id: string;
  username: string;
  password: string;
  url: string;
  principalUrl: string;
  accountType: DAV_ACCOUNT_TYPE;
}
