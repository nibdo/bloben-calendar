import { stompClient } from '../layers/AuthenticatedLayer';
import { reduxStore } from '../bloben-package/layers/ReduxLayer';
import Crypto from '../bloben-package/utils/encryption';
import {
  addCalendar,
  addNotification,
  setCalendars, setCalendarSettings,
  setEvents,
  setNotifications, setUserProfile
} from '../redux/actions';
import EventStateEntity from '../bloben-utils/models/event.entity';
import {
  cloneDeep,
  findInArrayById,
  findInEvents,
} from './common';
import CalendarApi, {
  sendWebsocketMessage,
  WEBSOCKET_GET_ONE_CALENDAR, WEBSOCKET_GET_ONE_CONTACT,
  WEBSOCKET_GET_ONE_EVENT,
  WEBSOCKET_GET_ONE_NOTIFICATION,
} from '../api/calendar';
import { GetEventWebsocketByIdDTO } from '../types/types';
import { isBefore, parseISO } from 'date-fns';
import CalendarStateEntity from '../data/models/state/calendar.entity';
import OpenPgp, { PgpKeys } from '../bloben-utils/utils/OpenPgp';
import { LocalForage } from '../bloben-package/utils/LocalForage';
import LuxonHelper from '../bloben-utils/utils/LuxonHelper';
import { DateTime } from 'luxon';
import CalendarSync from './sync/CalendarSync';
import SyncCalendars from './sync/CalendarSync';
import SyncEvents from './sync/EventsSync';
import { AxiosResponse } from 'axios';
import AccountApi from '../bloben-package/api/account.api';
import SyncNotification from '../bloben-package/sync/NotificationSync';

// Message constants
const WEBSOCKET_EVENT_MESSAGE: WebsocketMessageType = 'event';
const WEBSOCKET_CALENDAR_MESSAGE: WebsocketMessageType = 'calendar';
const WEBSOCKET_NOTIFICATION_MESSAGE: WebsocketMessageType = 'notification';
const WEBSOCKET_CALENDAR_SETTINGS_MESSAGE: WebsocketMessageType = 'calendarSettings';
const WEBSOCKET_USER_SETTINGS_MESSAGE: WebsocketMessageType = 'userProfile';
const WEBSOCKET_CONTACT_MESSAGE: WebsocketMessageType = 'contact';
type WebsocketMessageType = 'event' | 'calendar' | 'notification' | 'calendarSettings' | 'userProfile' | 'contact';

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
      case WEBSOCKET_NOTIFICATION_MESSAGE:
        await WebsocketHandler.handleNotificationSync(messageObj);
        break;
      case WEBSOCKET_CALENDAR_SETTINGS_MESSAGE:
        WebsocketHandler.handleCalendarSettingsSync(messageObj);
        break;
      case WEBSOCKET_USER_SETTINGS_MESSAGE:
        WebsocketHandler.handleUserSettingsSync(messageObj);
        break;
      case WEBSOCKET_CONTACT_MESSAGE:
        WebsocketHandler.handleUserSettingsSync(messageObj);
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
  /**
   * Process notification sync actions
   * @param messageObj
   */
  handleNotificationSync: async (messageObj: any) => {
    const action: WebsocketCrudAction = messageObj.action;
    // Filter actions
    switch (action) {
      case WEBSOCKET_CREATE_ACTION:
        await WebsocketHandler.handleCreateNotificationMessage(messageObj);
        break;
      case WEBSOCKET_UPDATE_ACTION:
        await WebsocketHandler.handleUpdateCalendarMessage(messageObj);
        break;
      case WEBSOCKET_SYNC_ACTION:
        await WebsocketHandler.handleSyncCalendarMessage(messageObj);
        break;
      default:
    }
  },
  /**
   * Process contact sync actions
   * @param messageObj
   */
  handleContactSync: async (messageObj: any) => {
    const action: WebsocketCrudAction = messageObj.action;
    // Filter actions
    switch (action) {
      case WEBSOCKET_CREATE_ACTION:
        await WebsocketHandler.handleCreateContact(messageObj);
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
    const { calendars } = store;
    const calendarInState: CalendarStateEntity | null = await findInArrayById(
      calendars,
      item.id
    );

    if (!calendarInState) {
      await CalendarSync.addCalendar(item.id)
    }
  },
  handleUpdateCalendarMessage: async (item: any): Promise<void> => {
    const store: any = reduxStore.getState();
    const { calendars } = store;

    const { id, updatedAt } = item;

    // Find if calendar is in state
    const calendarInState: CalendarStateEntity | null = await findInArrayById(
      calendars,
      id
    );
    // Get calendar from server if not found or if it is older
    if (
      !calendarInState) {
      await CalendarSync.addCalendar(item.id)
    } else if (LuxonHelper.isBefore(LuxonHelper.parseToString(calendarInState.updatedAt), updatedAt)) {
      await CalendarSync.updateCalendar(item.id)
    } else {
      // Flag found state item as synced
      const calendarToUpdate: CalendarStateEntity = CalendarStateEntity.flagAsSynced(
        calendarInState
      );
    }
  },
  handleDeleteCalendarMessage: async (item: any): Promise<void> => {
    const store: any = reduxStore.getState();
    const { calendars } = store;

    const { id } = item;

    const calendarInState: CalendarStateEntity | null = await findInArrayById(
      calendars,
      id
    );

    if (calendarInState) {
      SyncCalendars.deleteCalendar(id)
    }
  },
  handleCreateEventMessage: async (item: any): Promise<void> => {
    const store: any = reduxStore.getState();
    const { rangeFrom, rangeTo } = store;
    const { id, updatedAt } = item;
    // Find if event is in state
    const eventInState: EventStateEntity | null = await findInEvents(id);

    // Get event from server if not found, if needed to fetch all occurrences or is older
    if (
      !eventInState ||
      (eventInState && eventInState.isRepeated) ||
      eventInState.updatedAt !== updatedAt
    ) {
      // Construct request event body
      await SyncEvents.addEvent(id);

    } else {
      // Flag found state item as synced
      // TODO flag as synced
      // eventInState.flagAsSynced();
    }
  },
  handleUpdateEventMessage: async (item: any): Promise<void> => {
    const store: any = reduxStore.getState();

    const { id, updatedAt } = item;

    // Find if event is in state
    const eventInState: EventStateEntity | null = await findInEvents(id);
    // Get event from server if not found, if needed to fetch all occurrences or is older
    if (
        !eventInState) {
      await SyncEvents.addEvent(item.id)
    } else if (LuxonHelper.isBefore(LuxonHelper.parseToString(eventInState.updatedAt), updatedAt)) {

      await SyncEvents.updateEvent(item.id)
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
      const valueAfterFilter: any = array.filter(
        (item: any) => item.id !== messageObj.id
      );
      if (array.length !== valueAfterFilter) {
        stateClone[day] = valueAfterFilter;
      }
    }
    reduxStore.dispatch(setEvents(stateClone));
  },
  getEvents: async (message: string) => {
    const objParsed: any = JSON.parse(message);
    const { type, data } = objParsed;
    // Process and decode events
    if (type === 'events' || type === 'event') {
    } else if (type === 'allEvents') {
    }
  },
  getCalendars: async (message: string) => {
    const objParsed: any = JSON.parse(message);
    const { type, data } = objParsed;
    // Process and decode events
    // if (type === 'events' || type === 'event') {
    //   await decryptEvents(data);
    // }
  },
  getUpdate: async (setState: any, message: string, state: any) => {
    const { data, rangeFrom, rangeTo } = state;

    const objParsed: any = JSON.parse(message);

    // Get first and last day of events range
    stompClient.send(
      '/app/events/get/one',
      {},
      JSON.stringify({ id: objParsed.id, rangeFrom, rangeTo })
    );
  },
  handleCreateContact: async (item: any): Promise<void> => {
    const store: any = reduxStore.getState();
    const { notifications } = store;
    const notificationInState: any = await findInArrayById(
        notifications,
        item.id
    );

    if (!notificationInState) {
      sendWebsocketMessage(WEBSOCKET_GET_ONE_CONTACT, { id: item.id });
    }
  },
  handleCreateNotificationMessage: async (item: any): Promise<void> => {
    const store: any = reduxStore.getState();
    const { notifications } = store;
    const notificationInState: any = await findInArrayById(
      notifications,
      item.id
    );

    if (!notificationInState) {
      await SyncNotification.addNotification(item.id)
    }
  },
  handleCalendarSettingsSync: async (messageObj: any): Promise<void> => {
    const response: AxiosResponse = await CalendarApi.getCalendarSettings();

    reduxStore.dispatch(setCalendarSettings(response.data));
  },
  handleUserSettingsSync: async (messageObj: any): Promise<void> => {

    const response: AxiosResponse = await AccountApi.getUserProfile();

    reduxStore.dispatch(setUserProfile(response.data));
  },
  handleCreateNotification: async (message: string) => {
    const objParsed: any = JSON.parse(message);

    const store: any = reduxStore.getState();
    const password: string = store.password;
    const pgpKeys: PgpKeys = store.pgpKeys;
    const stateClone: any = cloneDeep(store.notifications);

    const { data } = objParsed;

    const decryptNotification = async (item: any) => {
      const {id} = item;

      let decryptedData: any = await OpenPgp.decrypt(
          pgpKeys.publicKey,
          pgpKeys.privateKey,
          password,
          item.data
      );
      decryptedData = JSON.parse(decryptedData);

      delete item.data;

      // Merge
      const notification: any = { ...item, ...decryptedData };

      const notificationInState: any = await findInArrayById(
          stateClone,
          id
      );

      // Create notification
      if (!notificationInState) {
        reduxStore.dispatch(addNotification(notification));
      } else {
        // Update notification in state
        const newState: any = stateClone.filter((clonedItem: any) =>
                                                    clonedItem.id === id ? notification : clonedItem
        );

        reduxStore.dispatch(setNotifications(newState));
      }
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        await decryptNotification(item);
      }
    } else {
      await decryptNotification(data);
    }

  },
};

export default WebsocketHandler;
