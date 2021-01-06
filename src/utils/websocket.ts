import { stompClient } from '../layers/authenticated-layer';
import { decryptAllEvents, decryptEvents } from './decrypt-events';
import { reduxStore } from '../bloben-package/layers/redux-layer';
import Crypto from '../bloben-package/utils/encryption';
import { addCalendar, setCalendars, setEvents } from '../redux/actions';
import EventStateEntity from '../data/entities/state/event.entity';
import { cloneDeep, findInArrayById, findInEvents, handleCalendarReduxDelete } from './common';
import {
    sendWebsocketMessage,
    WEBSOCKET_GET_ONE_CALENDAR,
    WEBSOCKET_GET_ONE_EVENT
} from '../api/calendar';
import { GetEventWebsocketByIdDTO } from '../types/types';
import { isBefore, parseISO } from 'date-fns';
import CalendarStateEntity from '../data/entities/state/calendar.entity';
import OpenPgp, {PgpKeys} from "../bloben-package/utils/OpenPgp";
import { LocalForage } from '../bloben-package/utils/LocalForage';

// Message constants
const WEBSOCKET_EVENT_MESSAGE: WebsocketMessageType = 'event'
const WEBSOCKET_CALENDAR_MESSAGE: WebsocketMessageType = 'calendar'
type WebsocketMessageType = 'event' | 'calendar';

// Action constants
const WEBSOCKET_CREATE_ACTION: WebsocketCrudAction = 'create';
const WEBSOCKET_UPDATE_ACTION: WebsocketCrudAction = 'update';
const WEBSOCKET_DELETE_ACTION: WebsocketCrudAction = 'delete';
const WEBSOCKET_SYNC_ACTION: WebsocketCrudAction = 'sync';
type WebsocketCrudAction = 'create' | 'update' | 'delete' | 'sync';

const WebsocketHandler = {
    /**
     * Filter and process messages from sync subscription after CRUD actions
     * @param message
     */
    handleSyncGeneral: async (message: any): Promise<void> => {
        const messageObj: any = JSON.parse(message.body);

        // Get message type
        const messageType: WebsocketMessageType = messageObj.type;

        // Process different messages types
        switch (messageType) {
            case WEBSOCKET_EVENT_MESSAGE:
                await WebsocketHandler.handleEventSync(messageObj);
                break;
            case WEBSOCKET_CALENDAR_MESSAGE:
                await WebsocketHandler.handleCalendarSync(messageObj);
                break;
            default:
        }
    },
    /**
     * Process event sync actions
     * @param messageObj
     */
    handleEventSync: async (messageObj: any) => {
        const action: WebsocketCrudAction = messageObj.action;

        // Filter actions
        switch (action) {
            case WEBSOCKET_CREATE_ACTION:
                await WebsocketHandler.handleCreateEventMessage(messageObj);
                break;
            case WEBSOCKET_UPDATE_ACTION:
                await WebsocketHandler.handleUpdateEventMessage(messageObj);
                break;
            case WEBSOCKET_DELETE_ACTION:
                WebsocketHandler.handleDeleteEventMessage(messageObj);
                break;
            case WEBSOCKET_SYNC_ACTION:
                await WebsocketHandler.handleSyncEventMessage(messageObj);
                break;
            default:
        }
    },
    /**
     * Process calendar sync actions
     * @param messageObj
     */
    handleCalendarSync: async (messageObj: any) => {
        const action: WebsocketCrudAction = messageObj.action;
        // Filter actions
        switch (action) {
            case WEBSOCKET_CREATE_ACTION:
                await WebsocketHandler.handleCreateCalendarMessage(messageObj);
                break;
            case WEBSOCKET_UPDATE_ACTION:
                await WebsocketHandler.handleUpdateCalendarMessage(messageObj);
                break;
            case WEBSOCKET_DELETE_ACTION:
                await WebsocketHandler.handleDeleteCalendarMessage(messageObj);
                break;
            case WEBSOCKET_SYNC_ACTION:
                await WebsocketHandler.handleSyncCalendarMessage(messageObj);
                break;
            default:
        }
    },
    handleSyncEventMessage: async (messageObj: any): Promise<void> => {
        if (!messageObj.data || messageObj.data.length === 0) {
            return;
        }
        for (const item of messageObj.data) {
            await WebsocketHandler.handleEventSync(item);
        }
    },
    handleSyncCalendarMessage: async (messageObj: any): Promise<void> => {
        if (!messageObj.data || messageObj.data.length === 0) {
            return;
        }
        for (const item of messageObj.data) {
           await WebsocketHandler.handleCalendarSync(item);
        }
    },
    handleCreateCalendarMessage: async (item: any): Promise<void> => {
        const store: any = reduxStore.getState();
        const {calendars} = store;
        const calendarInState: CalendarStateEntity | null = await findInArrayById(calendars, item.id);

        if (!calendarInState) {
            sendWebsocketMessage(WEBSOCKET_GET_ONE_CALENDAR, {id: item.id});
        }
    },
    handleUpdateCalendarMessage: async (item: any): Promise<void> => {
        const store: any = reduxStore.getState();
        const {calendars} = store;

        const {id, updatedAt} = item;

        // Find if calendar is in state
        const calendarInState: CalendarStateEntity | null = await findInArrayById(calendars, id);

        // Get calendar from server if not found or if it is older
        if (!calendarInState ||
            isBefore(calendarInState.updatedAt, parseISO(updatedAt))) {
            // Construct request event body
            sendWebsocketMessage(WEBSOCKET_GET_ONE_CALENDAR, {id});
        } else {
            // Flag found state item as synced
            const calendarToUpdate: CalendarStateEntity = CalendarStateEntity.flagAsSynced(calendarInState);
        }
    },
    handleDeleteCalendarMessage: async (item: any): Promise<void> => {
        const store: any = reduxStore.getState();
        const {calendars} = store;

        const {id} = item;

        const calendarInState: CalendarStateEntity | null = await findInArrayById(calendars, id);

        if (calendarInState) {
            handleCalendarReduxDelete(id)
        }
    },
    handleCreateEventMessage: async (item: any): Promise<void> => {
        const store: any = reduxStore.getState();
        const {rangeFrom, rangeTo} = store;
        const {id, updatedAt} = item;
        // Find if event is in state
        const eventInState: EventStateEntity | null = await findInEvents(id);

        // Get event from server if not found, if needed to fetch all occurrences or is older
        if (!eventInState
            || (eventInState && eventInState.isRepeated)
            || eventInState.updatedAt !== updatedAt) {
            // Construct request event body
            const requestEventDataById: GetEventWebsocketByIdDTO = {
                id,
                rangeFrom,
                rangeTo
            }

            sendWebsocketMessage(WEBSOCKET_GET_ONE_EVENT, requestEventDataById);
        } else {
            // Flag found state item as synced
            // TODO flag as synced
            // eventInState.flagAsSynced();
        }
    },
    handleUpdateEventMessage: async (item: any): Promise<void> => {
        const store: any = reduxStore.getState();
        const {rangeFrom, rangeTo} = store;

        const {id, updatedAt} = item;

        // Find if event is in state
        const eventInState: EventStateEntity | null = await findInEvents(id);
        // Get event from server if not found, if needed to fetch all occurrences or is older
        if (!eventInState ||
            isBefore(eventInState.updatedAt, parseISO(updatedAt))) {
            // Construct request event body
            const requestEventDataById: GetEventWebsocketByIdDTO = {
                id,
                rangeFrom,
                rangeTo
            }
            sendWebsocketMessage(WEBSOCKET_GET_ONE_EVENT, requestEventDataById);
        } else {
                // Flag found state item as synced
                // TODO flag as synced
                // eventInState.flagAsSynced();
        }
    },
    handleDeleteEventMessage: (messageObj: any): void => {
        const store: any = reduxStore.getState();
        // Handle merging state
        // Clone state
        const stateClone: any = cloneDeep(store.events);
        // Loop over days
        for (const [day, value] of Object.entries(stateClone)) {
            const array: any = value;
            // Loop over specific day events from server
            const valueAfterFilter: any = array.filter((item: any) =>
                item.id !== messageObj.id)
            if (array.length !== valueAfterFilter) {
                stateClone[day] = valueAfterFilter;
            }
        }
        reduxStore.dispatch(setEvents(stateClone));
    },
    getEvents: async (message: string) => {
        const objParsed: any = JSON.parse(message);
        const {type, data} = objParsed;
        // Process and decode events
        if (type === 'events' || type === 'event') {
            await decryptEvents(data);
        } else if (type === 'allEvents') {
            await decryptAllEvents(data);
        }
    },
    getCalendars: async (message: string) => {
        const objParsed: any = JSON.parse(message);
        const {type, data} = objParsed;
        // Process and decode events
        if (type === 'events' || type === 'event') {
            await decryptEvents(data);
        }
    },
    handleCreateCalendar: async (message: string) => {
        const objParsed: any = JSON.parse(message);

        const store: any = reduxStore.getState();
        const cryptoPassword: string = store.cryptoPassword;
        const password: string = store.password;
        const pgpKeys: PgpKeys = store.pgpKeys;
        const stateClone: any = cloneDeep(store.calendars);

        const {data} = objParsed;

        for (const item of data) {
            const {id} = item;

            let decryptedData: any;

            if (cryptoPassword) {
                decryptedData = await Crypto.decrypt(
                    item.data,
                    cryptoPassword
                );
            } else {
                decryptedData = await OpenPgp.decrypt(pgpKeys.publicKey, pgpKeys.privateKey, password, item.data);
                decryptedData = JSON.parse(decryptedData);
            }

            delete item.data;

            // Merge
            const calendarData: any = {...item, ...decryptedData};
            const calendar: any = new CalendarStateEntity(calendarData).getStoreObj();

            const calendarInState: CalendarStateEntity | null = await findInArrayById(stateClone, id);

            // Create calendar
            if (!calendarInState) {
                reduxStore.dispatch(addCalendar(calendar))
            } else {
                // Update calendar in state
                const newState: any = stateClone.filter((clonedCalendar: any) =>
                   clonedCalendar.id === id ? calendar : clonedCalendar)

                reduxStore.dispatch(setCalendars(newState))
                // TODO calendar and event color update
            }
        }

    },
    getUpdate: async  (setState: any, message: string, state: any) => {
        const {data, rangeFrom, rangeTo} = state;

        const objParsed: any = JSON.parse(message);

        // Get first and last day of events range
        stompClient.send('/app/events/get/one', {}, JSON.stringify(
            {id: objParsed.id, rangeFrom, rangeTo}
            ));

}
}

export default WebsocketHandler;
