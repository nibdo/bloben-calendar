export interface CalDavTaskSettings {
  id: string;
  calendarID: string;
  order: string[];
  orderBy: string;
}

export interface UpdateCalDavTaskSettingsRequest {
  order: string[];
  orderBy: string;
}
