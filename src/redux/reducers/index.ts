import { combineReducers } from 'redux';

import rangeFromReducer from './rangeFrom';
import rangeToReducer from './rangeTo';
import calendarDaysReducer from './calendarDays';
import eventsReducer from './events';
import cryptoPasswordReducer from './cryptoPassword';
import calendarViewReducer from './calendarView';
import selectedEventReducer from './selectedEvent';
import calendarsReducer from './calendars';
import isDarkReducer from './isDark';
import isMobile from './isMobile';
import isLogged from './isLogged';
import username from './username';
import isLoading from './isLoading';
import isAppStarting from './isAppStarting';
import passwords from './passwords';
import notifications from './notifications';
import selectedDate from './selectedDate';
import eventsAreFetching from './eventsAreFetching';
import calendarBodyWidth from './calendarBodyWidth';
import calendarBodyHeight from './calendarBodyHeight';
import calendarDaysCurrentIndex from './calendarDaysCurrentIndex';
import eventsLastSynced from './eventsLastSynced';
import allEvents from './allEvents';
import isFirstLogin from './isFirstLogin';
import pgpKeys from './pgpKeys';
import password from './password';
import defaultCalendar from './defaultCalendar';
import eventsToImport from './eventsToImport';
import isAndroidApp from './isAndroidApp';
import timezones from './timezones';
import defaultTimezone from './defaultTimezone';
import calendarSettings from './calendarSettings';
import warning from './warning';
import userProfile from '../../bloben-package/redux/reducers/userProfile';
import contacts from '../../bloben-package/redux/reducers/contacts';
import syncLog from './syncLog';

export const allReducers: any = combineReducers({
    isAndroidApp,
    userProfile,
    warning,
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
    cryptoPassword: cryptoPasswordReducer,
    events: eventsReducer,
    eventsToImport,
    calendarView: calendarViewReducer,
    selectedEvent: selectedEventReducer,
    calendars: calendarsReducer,
    isDark: isDarkReducer,
    isMobile,
    isLogged,
    username,
    isLoading,
    isAppStarting,
    passwords,
    notifications,
    selectedDate,
    eventsAreFetching,
    calendarBodyWidth,
    calendarBodyHeight,
    calendarDaysCurrentIndex,
    eventsLastSynced,
    allEvents,
    isFirstLogin
});
const rootReducer = (state: any, action: any) => {
    if (action.type === 'USER_LOGOUT') {
        // tslint:disable-next-line:no-parameter-reassignment
        state = undefined
    }

    return allReducers(state, action)
}
export default rootReducer;
