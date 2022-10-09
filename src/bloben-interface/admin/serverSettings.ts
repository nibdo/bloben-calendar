import { LOCATION_PROVIDER } from '../enums';

export interface GetServerSettings {
  checkNewVersion: boolean;
  emailCounter: number;
  locationProvider: LOCATION_PROVIDER;
}

export interface GetServerSettingsUser {
  locationProvider: LOCATION_PROVIDER;
}

export interface PatchServerSettings {
  checkNewVersion?: boolean;
  emailCounter?: number;
  locationProvider?: LOCATION_PROVIDER;
}
