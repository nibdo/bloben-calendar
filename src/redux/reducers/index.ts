import { combineReducers, Reducer } from 'redux';

import rangeFromReducer from './rangeFrom';
import rangeToReducer from './rangeTo';
import calendarDaysReducer from './calendarDays';
import eventsReducer from './events';
import calendarViewReducer from './calendarView';
import calendarsReducer from './calendars';
import username from './username';
import isLoading from './isLoading';
import isAppStarting from './isAppStarting';
import notifications from './notifications';
import selectedDate from './selectedDate';
import eventsAreFetching from './eventsAreFetching';
import calendarBodyWidth from './calendarBodyWidth';
import calendarBodyHeight from './calendarBodyHeight';
import calendarDaysCurrentIndex from './calendarDaysCurrentIndex';
import allEvents from './allEvents';
import isFirstLogin from './isFirstLogin';
import pgpKeys from './pgpKeys';
import password from './password';
import defaultCalendar from './defaultCalendar';
import eventsToImport from './eventsToImport';
import timezones from './timezones';
import defaultTimezone from './defaultTimezone';
import calendarSettings from './calendarSettings';
import userProfile from 'bloben-react/redux/reducers/userProfile';
import contacts from 'bloben-react/redux/reducers/contacts';
import syncLog from './syncLog';
import user from 'bloben-react/redux/reducers/user';
import { ReduxState } from '../../types/types';

export const allReducers: Reducer = combineReducers({
  user,
  userProfile,
  syncLog,
  contacts,
  calendarSettings,
  timezones,
  defaultTimezone,
  pgpKeys,
  defaultCalendar,
  password,
  rangeFrom: rangeFromReducer,
  rangeTo: rangeToReducer,
  calendarDays: calendarDaysReducer,
  events: eventsReducer,
  eventsToImport,
  calendarView: calendarViewReducer,
  calendars: calendarsReducer,
  username,
  isLoading,
  isAppStarting,
  notifications,
  selectedDate,
  eventsAreFetching,
  calendarBodyWidth,
  calendarBodyHeight,
  calendarDaysCurrentIndex,
  allEvents,
  isFirstLogin,
});

const rootReducer = (state: ReduxState | undefined, action: any) => {
  if (action.type === 'USER_LOGOUT') {
    // tslint:disable-next-line:no-parameter-reassignment
    state = undefined;
  }

  return allReducers(state, action);
};
export default rootReducer;
