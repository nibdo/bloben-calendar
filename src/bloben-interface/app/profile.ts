import { ROLE } from '../enums';

export interface GetProfileResponse {
  id: string;
  username: string;
  role: ROLE;
  isTwoFactorEnabled: boolean;
  language: string;
}

export interface PatchProfileRequest {
  language?: string;
}
