import { createBrowserHistory } from 'history';
import React, {  useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Redirect, Router } from 'react-router';
import {
  addDays, addMonths,
  formatISO,
  subDays,
} from 'date-fns';
import {  Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { AxiosResponse } from 'axios';

import Modal from '../bloben-package/components/modal';
import Settings from '../views/settings';
import Calendar from '../views/calendar/calendar';
import {
  chooseSelectedDateIndex,
  getCalendarDays,
} from '../components/calendar-view/calendar-common';
import NewCalendar from '../views/calendar-edit/new-calendar/new-calendar';
import Crypto from '../bloben-package/utils/encryption';
// @ts-ignore

import WebsocketHandler from '../utils/websocket'
import {
  setCalendarDays, setCalendarDaysCurrentIndex, setEventsToImport,
  setIsAppStarting, setIsFirstLogin,
  setRangeFrom,
  setRangeTo,
  setSelectedDate,
} from '../redux/actions';
import {
  getArrayEnd,
  getArrayStart, getDayTimeEnd,
  getDayTimeStart, getEventAndCalendarIds,
  nullTimeInDate
} from '../utils/common';
import { subscribeToPush } from '../bloben-package/utils/pushSubscription';
import { setServiceWorkerLister } from '../utils/ServiceWorkerListener';
import EditCalendar from '../views/calendar-edit/edit-calendar/edit-calendar';
import {
  sendWebsocketMessage,
  WEBSOCKET_GET_ALL_CALENDARS, WEBSOCKET_GET_ALL_EVENTS,
  WEBSOCKET_GET_EVENTS, WEBSOCKET_SYNC_CALENDARS, WEBSOCKET_SYNC_EVENTS
} from '../api/calendar';
import Axios from '../bloben-common/utils/axios';
import Search from '../views/search';
import IntroScreen from '../views/intro-screen/intro-screen';
import { checkIfIsSafari } from '../bloben-package/utils/common';
import { logger } from 'bloben-common/utils/common';
import EventImportButton from "../components/EventImporter/EventImportButton/EventImportButton";
import EventImport from "../components/EventImporter/EventImport";

// STOMP WEBSOCKETS
let socket;
export let stompClient: any;

// BROWSER HISTORY
const history: any = createBrowserHistory();

// INITIAL STATE
const initialState = {
  selectedDate: '',
  isLoadingCalendar: false,
  mappedCalendars: {},
  data: [],
  agendaDays: [],
  stateSavedAt: null,
};

const AuthenticatedLayer = (props: any) => {
  const calendars: any = useSelector((state: any) => state.calendars);
  const events: any = useSelector((state: any) => state.events);
  const rangeFrom: any = useSelector((state: any) => state.rangeFrom);
  const rangeTo: any = useSelector((state: any) => state.rangeTo);
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const calendarDaysCurrentIndex: number = useSelector((state: any) => state.calendarDaysCurrentIndex);
  const isFirstLogin: boolean = useSelector((state: any) => state.isFirstLogin);
  const isMobile: boolean = useSelector((state: any) => state.isMobile);

  const cryptoPassword: string = useSelector((state: any) => state.cryptoPassword);
  const selectedDate: Date = useSelector((state: any) => state.selectedDate);
  const calendarView: string = useSelector((state: any) => state.calendarView);
  const isAppStarting: boolean = useSelector((state: any) => state.isAppStarting);
  const eventsToImport: string = useSelector((state: any) => state.eventsToImport);

  const dispatch: Dispatch = useDispatch();

  const closeWebsockets = () => {
    // if (window.localStorage.getItem('isStorageProtected') === STRING_TRUE) {
    //   props.encryptDataOnUnload()
    // }
    if (stompClient) {
      stompClient.disconnect();
    }
    logger('DISCONNECT WS')
  }

  useEffect(() =>
    () => {
      // alert("AsDAd")
      closeWebsockets()
    },      []);

  /**
   * Fetch all events on first login
   */
  const handleFirstLogin = (): void => {
    if (isFirstLogin) {
      sendWebsocketMessage(WEBSOCKET_GET_ALL_EVENTS, {lastSync: null})
      dispatch(setIsFirstLogin(false))
    }
  }

  const connectToWs = async (): Promise<void> => {
    // First verify if session is still active
    try {
      const response: AxiosResponse = await Axios.get('/user/account');
      if (response.status !== 200) {
        dispatch({type: 'USER_LOGOUT'});

        return;
      }
      if (response.data && !response.data.username) {
        dispatch({type: 'USER_LOGOUT'});

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
        setTimeout(connectToWs, 7000)
      }
    }




    // TODO to websocket
    const sendIdsToSync = () => {
      // Get event and calendar ids
      const data: any = getEventAndCalendarIds();
      const {calendars, events} = data;

      if (calendars && calendars.length > 0) {
        sendWebsocketMessage(WEBSOCKET_SYNC_CALENDARS, calendars)
      }

      if (events && events.length > 0) {
        sendWebsocketMessage(WEBSOCKET_SYNC_EVENTS, events)
      }
    }

    // Init connection
    stompClient.connect('user', 'password',
                        () => {
                          // TODO REsolve not loading on init
                          setTimeout(() => {
                            handleFirstLogin()

                            const currentDate: Date = new Date();
                            const rangeFromInit: Date = getDayTimeStart(subDays(currentDate, 7));
                            const rangeToInit: Date = getDayTimeEnd(addDays(currentDate, 14));

                            sendWebsocketMessage(WEBSOCKET_GET_ALL_CALENDARS)
                            sendWebsocketMessage(WEBSOCKET_GET_EVENTS, {rangeFrom: formatISO(rangeFromInit), rangeTo: formatISO(rangeToInit)})
                            dispatch(setIsAppStarting(false))
                            // Send all event and calendar ids to server to check if they exist
                            // Return only ids of items to delete
                            sendIdsToSync()
                            stompClient.subscribe('/user/notifications', function(message: any) {
                            });
                          },         20)

                          // Receive automatic updates from server
                          stompClient.subscribe('/user/sync',  (message: any) => {
                            WebsocketHandler.handleSyncGeneral(message)

                          });
                          stompClient.subscribe('/user/events', function(message: any) {
                            WebsocketHandler.getEvents(message.body);
                          });
                          stompClient.subscribe('/user/calendars', function(message: any) {
                            WebsocketHandler.handleCreateCalendar(message.body);
                          });
                          stompClient.send('/app/notifications', {}, JSON.stringify({name: 'username'})
                          );
                          stompClient.send('/app/updates', {}, JSON.stringify({name: 'store.username'})
                          );
                          // Do something
                        }, function(e: any) {
          connectToWs()
          console.log('ERROR ', e)
        });

  }

  const { initPath } = props;

  const initLoad = async () => {
    connectToWs()

    if (!checkIfIsSafari()) {
      await setServiceWorkerLister();
      await subscribeToPush();
    }

    const currentDate: Date = nullTimeInDate(new Date());

    // Set init date range
    const rangeFromInit: Date = getDayTimeStart(subDays(currentDate, 7));
    const rangeToInit: Date = getDayTimeEnd(addDays(currentDate, 14));

    dispatch(setRangeFrom(rangeFromInit))
    dispatch(setRangeTo(rangeToInit))
    // sendMessage()

  };

  useEffect(() => {
    initLoad();
    const currentDate: any = new Date();
    initCalendar(currentDate);

  },        []);

  useEffect(() => {
    const currentDate: Date = new Date();
    initCalendar(currentDate);

  },        [calendarView]);

  // Navigate to custom user url path passed on app load
  const userCustomRoute: any =
    // @ts-ignore
    initPath.length > process.env.REACT_APP_URL.length &&
    process.env.REACT_APP_URL
      ? initPath.slice(process.env.REACT_APP_URL.length)
      : null;

  const initCalendar = (date: any) => {
    const calendarDaysNew = getCalendarDays(
        calendarView,
        date,
        null, true
    );

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
    dispatch(setCalendarDaysCurrentIndex(1))

    dispatch(setCalendarDays([calendarDaysPrevNew, calendarDaysNew, calendarDaysNextNew]))

  };

  const calculateCalendarDays = (
                                 nextIndex: number,
                                 isGoingForward: boolean) => {
    if (isGoingForward) {
      switch (nextIndex) {
        case (0):
          return [calendarDays[0], getCalendarDays(
              calendarView,
              getArrayEnd(calendarDays[0]),
              isGoingForward
          ),      calendarDays[2]]
        case (1):
          return [calendarDays[0], calendarDays[1], getCalendarDays(
              calendarView,
              getArrayEnd(calendarDays[1]),
              isGoingForward
          ) ]
        case (2):
          return [getCalendarDays(
              calendarView,
              getArrayEnd(calendarDays[2]),
              isGoingForward
          ),      calendarDays[1], calendarDays[2] ];
        default:
          return 1;
      }
    } else {
      switch (nextIndex) {
        case (0):
          return [calendarDays[0], calendarDays[1], getCalendarDays(
              calendarView,
              getArrayStart(calendarDays[0]), isGoingForward) ]
        case (1):
          return [getCalendarDays(
              calendarView,
              getArrayStart(calendarDays[1]),
              isGoingForward
          ),      calendarDays[1], calendarDays[2] ]
        case (2):
          // 0 1 2
          return [calendarDays[0], getCalendarDays(
              calendarView,
              getArrayStart(calendarDays[2]),
              isGoingForward
          ),      calendarDays[2]];
        default:
          return 1;
      }
    }
  }

  const getNextIndex = (isGoingForward: boolean): number =>
  {
    if (isGoingForward) {
      switch (calendarDaysCurrentIndex) {
        case (0):
          return 1;
        case (1):
          return 2;
        case (2):
          return 0;
        default:
          return 2;
      }
    }

    switch (calendarDaysCurrentIndex) {
      case (0):
        return 2;
      case (1):
        return 0;
      case (2):
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Calculate new calendar days and get events
   * @param isGoingForward
   * @param index
   */
  const getNewCalendarDays = (isGoingForward: boolean, index: number) => {
    if (isGoingForward === undefined) {
      requestEvents()

      return;
    }

    const nextIndex: number = index ? index : getNextIndex(isGoingForward);
    const newCalendarDays: any = calculateCalendarDays(nextIndex, isGoingForward)

    dispatch(setCalendarDays(newCalendarDays))
    dispatch(setCalendarDaysCurrentIndex(nextIndex))
    dispatch(setSelectedDate(newCalendarDays[nextIndex][chooseSelectedDateIndex(calendarView)]));

    // Set range for fetch new events
    const rangeFromFetch: Date = getDayTimeStart(getArrayStart(newCalendarDays[nextIndex]))
    const rangeToFetch: Date = getDayTimeEnd(getArrayEnd(newCalendarDays[nextIndex]))

    // Store new edge value of range
    if (isGoingForward) {
      dispatch(setRangeTo(rangeToFetch))
    } else {
      dispatch(setRangeFrom(rangeFromFetch))
    }

    sendWebsocketMessage(WEBSOCKET_GET_EVENTS, {rangeFrom: formatISO(rangeFromFetch), rangeTo: formatISO(rangeToFetch)})
  };

   const requestEvents = (): void => {
    const newRangeTo: Date = addMonths(rangeTo, 2);
    dispatch(setRangeFrom(rangeTo))
    dispatch(setRangeTo(newRangeTo))

    sendWebsocketMessage(WEBSOCKET_GET_EVENTS, {rangeFrom: formatISO(rangeTo), rangeTo: formatISO(newRangeTo)})
  }

  /**
   * Listener for different state
   */
  // Redirect to event import
  useEffect(() => {
    if (eventsToImport.length > 2) {
      history.push('/calendar/events/import/ics')
    }

  }, [eventsToImport])

  return !isAppStarting ? (
    <div className={'app_wrapper'}>
      {/*{!cryptoPassword ? <Redirect to={'/calendar'}/> : null}*/}
      <Router history={history}>
        {userCustomRoute && userCustomRoute !== '' && userCustomRoute !== '/' ? (
          <Redirect to={userCustomRoute} />
        ) : (
          <Redirect to={'/calendar'} />
        )
        }
        <Route exact path={'/search'}>
          {isMobile ? (
            <Modal {...props}>
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
        <Modal {...props}>
          <Search />
        </Modal>
            </div>
          )}
        </Route>
        <Route path={'/settings'}>
          {isMobile ?           <Modal {...props}>
            <Settings />
          </Modal> : <Settings/>}
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
              selectedDate={selectedDate}
              getNewCalendarDays={getNewCalendarDays}
              // mappedCalendars={mappedCalendars}
              allDays={events}
              initCalendar={initCalendar}
            />
          ) : null}
        </Route>

        <Route exact path={'/calendar/new'}>
          <Modal {...props}>
            <NewCalendar/>
          </Modal>
        </Route>
        <Route exact path={'/calendar/edit/:id'}>
          <Modal {...props}>
           <EditCalendar />
          </Modal>
        </Route>

        <Route path={'/calendar/events/import'}>
          <Modal {...props}>
            <EventImportButton autoFocus={true}/>
          </Modal>
        </Route>
        <Route path={'/calendar/events/import/ics'}>
          <Modal {...props}>
            <EventImport />
          </Modal>
        </Route>
        <Route exact path={'/about'} render={() => <IntroScreen />} />
      </Router>

    </div>
  ) : null;
};

export default AuthenticatedLayer;
