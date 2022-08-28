import { ITEM_SIZE } from './enums';

export const SOCKET_AUTH_PREFIX = 'clientSessionId_';

export const APP_API_VERSION_1 = '/v1';

export const DESKTOP_MIN_WIDTH = 750;
export const MARGIN_LEFT_EVENT_VIEW_ITEM = 20;

export const getSize = (isMobile: boolean): ITEM_SIZE =>
  isMobile ? ITEM_SIZE.MEDIUM : ITEM_SIZE.MEDIUM;

export const getTableSize = (isMobile: boolean): ITEM_SIZE =>
  isMobile ? ITEM_SIZE.SMALL : ITEM_SIZE.MEDIUM;

export const getTableTitlePaddingLeft = (isMobile: boolean) =>
  isMobile ? 4 : 6;
