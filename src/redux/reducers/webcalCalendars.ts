import { GetWebcalCalendarsResponse } from '../../bloben-interface';

export type WebcalCalendar = GetWebcalCalendarsResponse;

const webcalCalendars = (state: WebcalCalendar[] = [], action: any) => {
  switch (action.type) {
    case 'SET_WEBCAL_CALENDARS':
      return action.payload;
    case 'ADD_TO_WEBCAL_CALENDARS':
      return [...state, ...action.payload];
    default:
      return state;
  }
};

export default webcalCalendars;
