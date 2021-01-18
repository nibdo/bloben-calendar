/* tslint:disable:no-magic-numbers */
import { createBrowserHistory } from 'history';
import React, { useContext, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Redirect, Router } from 'react-router';
import {
  addDays,
  addMonths,
  format,
  formatISO,
  parseJSON,
  subDays,
} from 'date-fns';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { AxiosResponse } from 'axios';

import Settings from '../views/settings/Settings';
import WebsocketHandler from '../utils/websocket';
import {
  setCalendarDays,
  setCalendarDaysCurrentIndex,
  setDefaultCalendar,
  setIsAppStarting,
  setIsFirstLogin,
  setRangeFrom,
  setRangeTo,
  setSelectedDate,
} from '../redux/actions';
import {
  getArrayEnd,
  getArrayStart,
  getDayTimeEnd,
  getDayTimeStart,
  getEventAndCalendarIds,
  nullTimeInDate,
} from '../utils/common';
import { subscribeToPush } from 'bloben-package/utils/pushSubscription';
import { setServiceWorkerLister } from '../utils/ServiceWorkerListener';
import CalendarApi, {
  sendWebsocketMessage,
  WEBSOCKET_GET_ALL_CALENDARS,
  WEBSOCKET_GET_ALL_EVENTS,
  WEBSOCKET_GET_EVENTS, WEBSOCKET_GET_NOTIFICATIONS,
  WEBSOCKET_SYNC_CALENDARS,
  WEBSOCKET_SYNC_EVENTS,
} from '../api/calendar';
import Axios from '../bloben-common/utils/axios';
import Search from '../views/search/Search';
import IntroScreen from '../views/introScreen/IntroScreen';
import {
  findInArrayById,
  sendMessageToReactNative,
} from 'bloben-package/utils/common';
import { checkIfIsSafari, logger } from 'bloben-common/utils/common';
import { Context } from 'bloben-package/context/store';
import {
  chooseSelectedDateIndex,
  getCalendarDays,
} from '../components/calendarView/calendar-common';
import Modal from 'bloben-package/components/modal/Modal';
import EventImport from '../components/eventImporter/EventImport';
import EventImportButton from '../components/eventImporter/eventImporterButton/EventImportButton';
import NewCalendar from '../views/calendarEdit/newCalendar/NewCalendar';
import EditCalendar from '../views/calendarEdit/editCalendar/EditCalendar';
import Calendar from '../views/calendar/Calendar';
import Notifications from '../bloben-package/views/notifications/Notifications';

// STOMP WEBSOCKETS
let socket;
export let stompClient: any;

// BROWSER HISTORY
const history: any = createBrowserHistory();

const AuthenticatedLayer = () => {
  const [store] = useContext(Context);
  const { isReactNative, isMobile } = store;

  const defaultCalendar: string = useSelector((state: any) => state.defaultCalendar);
  const calendars: any = useSelector((state: any) => state.calendars);
  const events: any = useSelector((state: any) => state.events);
  const isFirstLogin: boolean = useSelector((state: any) => state.isFirstLogin);
  const allEvents: any = useSelector((state: any) => state.allEvents);
  const calendarView: any = useSelector((state: any) => state.calendarView);
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const calendarDaysCurrentIndex: any = useSelector(
    (state: any) => state.calendarDaysCurrentIndex
  );
  const rangeTo: Date = useSelector((state: any) => state.rangeTo);
  const eventsToImport: any = useSelector((state: any) => state.eventsToImport);
  const isAppStarting: boolean = useSelector(
    (state: any) => state.isAppStarting
  );
  const selectedDate: Date = useSelector((state: any) => state.selectedDate);

  const eventsLastSynced: Date = useSelector(
    (state: any) => state.eventsLastSynced
  );

  const dispatch: Dispatch = useDispatch();

  const closeWebsockets = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
    logger('DISCONNECT WS');
  };

  useEffect(
    () => () => {
      closeWebsockets();
    },
    []
  );

  const loadDefaultCalendar = async () => {
    const settings: any = await CalendarApi.getCalendarSettings();

    dispatch(setDefaultCalendar(settings.defaultCalendar));
  }

  /**
   * Fetch all events on first login
   */
  const handleFirstLogin = (): void => {
    if (isFirstLogin) {
      sendWebsocketMessage(WEBSOCKET_GET_ALL_EVENTS, { lastSync: null });
      dispatch(setIsFirstLogin(false));

      // Load app settings
      loadDefaultCalendar()
    }
  };

  const connectToWs = async (): Promise<void> => {
    // First verify if session is still active
    try {
      const response: AxiosResponse = await Axios.get('/user/account');
      if (response.status !== 200) {
        dispatch({ type: 'USER_LOGOUT' });

        return;
      }
      if (response.data && !response.data.username) {
        dispatch({ type: 'USER_LOGOUT' });

        return;
      }
    } catch (e) {
      // Return, user might be just offline
      return;
    }

    // Clear stompClient after lost connection
    socket = null;
    stompClient = null;

    // Need to create new instance on each reconnect with server
    socket = new SockJS(`${process.env.REACT_APP_API_URL as string}/ws`);
    stompClient = Stomp.over(socket);

    // Handle connection loss
    stompClient.debug = (frame: any) => {
      if (frame.indexOf('Connection closed') !== -1) {
        setTimeout(connectToWs, 7000);
      }
    };

    // TODO to websocket
    const sendIdsToSync = () => {
      // Get event and calendar ids
      const data: any = getEventAndCalendarIds();

      if (calendars && calendars.length > 0) {
        sendWebsocketMessage(WEBSOCKET_SYNC_CALENDARS, data.calendars);
      }

      if (events && events.length > 0) {
        sendWebsocketMessage(WEBSOCKET_SYNC_EVENTS, data.events);
      }
    };

    // Init connection
    stompClient.connect(
      'user',
      'password',
      () => {
        // TODO REsolve not loading on init
        setTimeout(() => {
          handleFirstLogin();

          const currentDate: Date = new Date();
          const rangeFromInit: Date = getDayTimeStart(subDays(currentDate, 7));
          const rangeToInit: Date = getDayTimeEnd(addDays(currentDate, 14));

          sendWebsocketMessage(WEBSOCKET_GET_NOTIFICATIONS);
          sendWebsocketMessage(WEBSOCKET_GET_ALL_CALENDARS);
          sendWebsocketMessage(WEBSOCKET_GET_ALL_EVENTS, {
            lastSync: eventsLastSynced ? eventsLastSynced.toISOString() : null,
          });
          sendWebsocketMessage(WEBSOCKET_GET_EVENTS, {
            rangeFrom: formatISO(rangeFromInit),
            rangeTo: formatISO(rangeToInit),
          });
          dispatch(setIsAppStarting(false));
          // Send all event and calendar ids to server to check if they exist
          // Return only ids of items to delete
          sendIdsToSync();
          stompClient.subscribe('/user/notifications', (message: any) => {
            WebsocketHandler.handleCreateNotification(message.body);
          });
        }, 20);

        // Receive automatic updates from server
        stompClient.subscribe('/user/sync', (message: any) => {
          console.log(message.body)
          WebsocketHandler.handleSyncGeneral(message);
        });
        stompClient.subscribe('/user/events', (message: any) => {
          WebsocketHandler.getEvents(message.body);
        });
        stompClient.subscribe('/user/calendars', (message: any) => {
          WebsocketHandler.handleCreateCalendar(message.body);
        });
        stompClient.send(
          '/app/notifications',
          {},
          JSON.stringify({ name: 'username' })
        );
        stompClient.send(
          '/app/updates',
          {},
          JSON.stringify({ name: 'store.username' })
        );
        // Do something
      },
      (e: any) => {
        connectToWs();
        console.log('ERROR ', e);
      }
    );
  };

  const initLoad = () => {
    connectToWs();

    if (!defaultCalendar) {
      loadDefaultCalendar();
    }

    if (!checkIfIsSafari()) {
      setServiceWorkerLister();
      subscribeToPush();
    }

    const currentDate: Date = nullTimeInDate(new Date());

    // Set init date range
    const rangeFromInit: Date = getDayTimeStart(subDays(currentDate, 7));
    const rangeToInit: Date = getDayTimeEnd(addDays(currentDate, 14));

    dispatch(setRangeFrom(rangeFromInit));
    dispatch(setRangeTo(rangeToInit));
  };

  // Get scheduled reminders for notifications from React Native wrapper
  const getRemindersForReactNative = async () => {
    if (isReactNative) {
      const result: any = [];
      // Get current reminders
      const reminders: any = await CalendarApi.getScheduledReminders();

      for (const reminder of reminders) {
        const reminderPayload: any = JSON.parse(reminder.payload);

        const eventWithReminder: any = await findInArrayById(
          allEvents,
          reminderPayload.id
        );

        reminder.title = 'Event reminder';

        if (eventWithReminder) {
          reminder.body = `${eventWithReminder.text} starts at ${format(
            parseJSON(eventWithReminder.startAt),
            'HH:MM, dd. MMMM'
          )}`;
        } else {
          reminder.body = 'Unknown body';
        }

        result.push(reminder);
      }

      // Try to find events in storage to get decrypted text content for local notification
      sendMessageToReactNative({
        action: 'scheduledReminders',
        data: reminders,
      });
    }
  };

  useEffect(() => {
    initLoad();

    getRemindersForReactNative();
    const currentDate: any = new Date();
    initCalendar(currentDate);
  }, []);

  useEffect(() => {
    const currentDate: Date = new Date();
    initCalendar(currentDate);
  }, [calendarView]);

  const initCalendar = (date: any) => {
    const calendarDaysNew = getCalendarDays(calendarView, date, null, true);

    const calendarDaysPrevNew = getCalendarDays(
      calendarView,
      getArrayStart(calendarDaysNew),
      false
    );

    const calendarDaysNextNew = getCalendarDays(
      calendarView,
      getArrayEnd(calendarDaysNew),
      true
    );
    dispatch(setCalendarDaysCurrentIndex(1));

    dispatch(
      setCalendarDays([
        calendarDaysPrevNew,
        calendarDaysNew,
        calendarDaysNextNew,
      ])
    );
  };

  const calculateCalendarDays = (
    nextIndex: number,
    isGoingForward: boolean
  ) => {
    if (isGoingForward) {
      switch (nextIndex) {
        case 0:
          return [
            calendarDays[0],
            getCalendarDays(
              calendarView,
              getArrayEnd(calendarDays[0]),
              isGoingForward
            ),
            calendarDays[2],
          ];
        case 1:
          return [
            calendarDays[0],
            calendarDays[1],
            getCalendarDays(
              calendarView,
              getArrayEnd(calendarDays[1]),
              isGoingForward
            ),
          ];
        case 2:
          return [
            getCalendarDays(
              calendarView,
              getArrayEnd(calendarDays[2]),
              isGoingForward
            ),
            calendarDays[1],
            calendarDays[2],
          ];
        default:
          return 1;
      }
    } else {
      switch (nextIndex) {
        case 0:
          return [
            calendarDays[0],
            calendarDays[1],
            getCalendarDays(
              calendarView,
              getArrayStart(calendarDays[0]),
              isGoingForward
            ),
          ];
        case 1:
          return [
            getCalendarDays(
              calendarView,
              getArrayStart(calendarDays[1]),
              isGoingForward
            ),
            calendarDays[1],
            calendarDays[2],
          ];
        case 2:
          // 0 1 2
          return [
            calendarDays[0],
            getCalendarDays(
              calendarView,
              getArrayStart(calendarDays[2]),
              isGoingForward
            ),
            calendarDays[2],
          ];
        default:
          return 1;
      }
    }
  };

  const getNextIndex = (isGoingForward: boolean): number => {
    if (isGoingForward) {
      switch (calendarDaysCurrentIndex) {
        case 0:
          return 1;
        case 1:
          return 2;
        case 2:
          return 0;
        default:
          return 2;
      }
    }

    switch (calendarDaysCurrentIndex) {
      case 0:
        return 2;
      case 1:
        return 0;
      case 2:
        return 1;
      default:
        return 0;
    }
  };

  /**
   * Calculate new calendar days and get events
   * @param isGoingForward
   * @param index
   */
  const getNewCalendarDays = (isGoingForward: boolean, index: number) => {
    if (isGoingForward === undefined) {
      requestEvents();

      return;
    }

    const nextIndex: number = index ? index : getNextIndex(isGoingForward);
    const newCalendarDays: any = calculateCalendarDays(
      nextIndex,
      isGoingForward
    );

    dispatch(setCalendarDays(newCalendarDays));
    dispatch(setCalendarDaysCurrentIndex(nextIndex));
    dispatch(
      setSelectedDate(
        newCalendarDays[nextIndex][chooseSelectedDateIndex(calendarView)]
      )
    );

    // Set range for fetch new events
    const rangeFromFetch: Date = getDayTimeStart(
      getArrayStart(newCalendarDays[nextIndex])
    );
    const rangeToFetch: Date = getDayTimeEnd(
      getArrayEnd(newCalendarDays[nextIndex])
    );

    // Store new edge value of range
    if (isGoingForward) {
      dispatch(setRangeTo(rangeToFetch));
    } else {
      dispatch(setRangeFrom(rangeFromFetch));
    }

    sendWebsocketMessage(WEBSOCKET_GET_EVENTS, {
      rangeFrom: formatISO(rangeFromFetch),
      rangeTo: formatISO(rangeToFetch),
    });
  };

  const requestEvents = (): void => {
    const newRangeTo: Date = addMonths(rangeTo, 2);
    dispatch(setRangeFrom(rangeTo));
    dispatch(setRangeTo(newRangeTo));

    sendWebsocketMessage(WEBSOCKET_GET_EVENTS, {
      rangeFrom: formatISO(rangeTo),
      rangeTo: formatISO(newRangeTo),
    });
  };

  /**
   * Listener for different state
   */
  // Redirect to event import
  useEffect(() => {
    if (eventsToImport.length > 2) {
      history.push('/calendar/events/import/ics');
    }
  }, [eventsToImport]);


  return !isAppStarting ? (
    <div className={'app_wrapper'}>
      <Router history={history}>
        <Redirect to={'/calendar'} />
        <Route exact path={'/search'}>
          {isMobile ? (
            <Modal>
              <Search />
            </Modal>
          ) : (
            <div
              style={{
                position: 'absolute',
                right: 150,
                top: 16,
                zIndex: 999,
                width: '30%',
              }}
            >
              <Modal>
                <Search />
              </Modal>
            </div>
          )}
        </Route>
        <Route path={'/settings'}>
          {isMobile ? (
            <Modal>
              <Settings />
            </Modal>
          ) : (
            <Settings />
          )}
        </Route>

        <Route path={'/calendar'}>
          {(calendarDays &&
            selectedDate &&
            calendarDays.length > 0 &&
            calendars.length > 0) ||
          (selectedDate &&
            calendarView === 'agenda' &&
            calendars.length > 0) ? (
            <Calendar
              getNewCalendarDays={getNewCalendarDays}
              initCalendar={initCalendar}
            />
          ) : null}
        </Route>

        <Route exact path={'/calendar/new'}>
          <Modal>
            <NewCalendar />
          </Modal>
        </Route>
        <Route exact path={'/calendar/edit/:id'}>
          <Modal>
            <EditCalendar />
          </Modal>
        </Route>

        <Route path={'/calendar/events/import'}>
          <Modal>
            <EventImportButton autoFocus={true} />
          </Modal>
        </Route>
        <Route path={'/calendar/events/import/ics'}>
          <Modal>
            <EventImport />
          </Modal>
        </Route>
        <Route exact path={'/about'} render={() => <IntroScreen />} />
      </Router>
    </div>
  ) : null;
};

export default AuthenticatedLayer;
