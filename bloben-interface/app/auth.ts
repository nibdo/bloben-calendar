export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginDemoRequest {
  username: string;
  password: string;
  redirect: string;
}
export interface LoginResponse {
  message: string;
  isLogged: boolean;
  isTwoFactorEnabled: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface GetSessionResponse {
  isLogged: boolean;
  userID: string;
  username: string;
}

export interface AddEmailRequest {
  email: string;
}
