export interface PostSharedLinkRequest {
  name: string;
  calDavCalendars: string[];
  webcalCalendars: string[];
  expireAt: string | null;
  password: string | null;
  settings: any;
}

export interface SharedCalendar {
  id: string;
  name: string;
}

export interface GetSharedCalendarResponse {
  id: string;
  name: string;
  password: string | null;
  webcalCalendars: SharedCalendar[];
  calDavCalendars: SharedCalendar[];
  expireAt: string | null;
}

export interface GetSharedCalendarsResponse {
  id: string;
  name: string;
  isEnabled: boolean;
}

export interface PostSendSharedCalendarInviteRequest {
  recipients: string[];
  emailBody: string;
}
