import { ISyncLog } from '../../types/types';
import { DateTime } from 'luxon';

const INIT_YEAR: number = 1980;
export const DEFAULT_DATE: string = new Date(INIT_YEAR, 1, 1).toISOString();

const initSyncLog: ISyncLog = {
    calendars: DEFAULT_DATE,
    events: DEFAULT_DATE,
    eventsAll: DEFAULT_DATE,
    contacts: DEFAULT_DATE,
    notifications: DEFAULT_DATE
}
const syncLog = (state: ISyncLog = initSyncLog, action: any) => {
    const dateNow: string = DateTime.local().toUTC().toString();

    switch (action.type) {
        case 'SET_CALENDARS_SYNC_LOG':
            return {...state, calendars: dateNow};
        case 'SET_EVENTS_SYNC_LOG':
            return {...state, events: dateNow};
        case 'SET_ALL_EVENTS_SYNC_LOG':
            return {...state, eventsAll: dateNow};
        case 'SET_CONTACTS_SYNC_LOG':
            return {...state, contacts: dateNow};
        case 'SET_NOTIFICATIONS_SYNC_LOG':
            return {...state, notifications: dateNow};
        default:
            return state;
    }
}

export default syncLog;
