export interface CalDavTask {
  id: string;
  startAt: string | null;
  endAt: string | null;
  timezoneStartAt: string | null;
  summary: string;
  location: string;
  description: string;
  allDay: boolean;
  rRule: string | null;
  externalID: string;
  etag: string;
  href: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  calendarID: string;
  status: string;
}
