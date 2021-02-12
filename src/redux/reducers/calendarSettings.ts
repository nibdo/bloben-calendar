import { ICalendarSettings } from '../../types/types';

const initCalendarSettings: ICalendarSettings = {
    defaultCalendar: null,
    defaultTimezone: '',
    defaultAlarmType: '',
    autoUpdateTimezone: false,
}

const calendarSettings = (state: ICalendarSettings = initCalendarSettings, action: any) => {
    switch (action.type) {
        case 'SET_CALENDAR_SETTINGS':
            return action.payload;
        case 'UPDATE_TIMEZONE_SETTING':
            return {...state, ...{defaultTimezone: action.payload}}
        case 'UPDATE_AUTO_UPDATE_TIMEZONE_SETTING':
            return {...state, ...{autoUpdateTimezone: action.payload}}
        default:
            return state;
    }
}

export default calendarSettings;
