import { ROLE } from '../enums';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminChangePasswordRequest {
  oldPassword: string;
  password: string;
}

export interface GetAdminAccountResponse {
  username: string | null;
  isLogged: boolean;
  role: ROLE | null;
  isTwoFactorEnabled: boolean;
}

export interface GetUsersResponse {
  id: string;
  username: string;
  isEnabled: boolean;
  role: ROLE;
  emailsAllowed: boolean;
}

export interface AdminCreateUserRequest {
  username: string;
  password: string;
}

export interface AdminUpdateUserRequest {
  isEnabled: boolean;
  emailsAllowed: boolean;
  role?: ROLE;
}
