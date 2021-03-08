import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { AxiosResponse } from 'axios';
import { DateTime } from 'luxon';
import { useHistory } from 'react-router';

import {
  setCalendarSettings,
  setDefaultCalendar,
  setDefaultTimezone,
  setIsFirstLogin,
  setRangeFrom,
  setRangeTo,
  setTimezones,
  updateTimezoneSetting,
} from '../redux/actions';
import { CalendarView, ReduxState } from '../types/types';
import {
  getDayTimeEnd,
  getDayTimeStart,
  setNullTimeInDate,
} from '../utils/common';
import CalendarSync from '../utils/sync/CalendarSync';
import CalendarApi from '../api/calendar';
import { setServiceWorkerLister } from '../utils/ServiceWorkerListener';
import { getEventsInRange } from '../utils/getEventsInRange';
import { initCalendarAction } from '../utils/initCalendarAction';
import {
  GeneralApi,
  getLocalTimezone,
  checkIfIsSafari,
  subscribeToPush,
} from 'bloben-utils';
import ContactSync from '../sync/ContactSync';
import SyncNotification from '../sync/NotificationSync';

interface CalendarLogicProps {
  children: any;
}
const CalendarLogic = (props: CalendarLogicProps) => {
  const dispatch: Dispatch = useDispatch();
  const history: any = useHistory();

  const isFirstLogin: boolean = useSelector(
    (state: ReduxState): boolean => state.isFirstLogin
  );
  const calendarView: CalendarView = useSelector(
    (state: ReduxState): CalendarView => state.calendarView
  );
  const eventsToImport: any = useSelector(
    (state: ReduxState) => state.eventsToImport
  );

  const setupTimezones = async (): Promise<void> => {
    const timezones: AxiosResponse = await GeneralApi.getTimezones();

    dispatch(setTimezones(timezones.data.data));
  };

  /**
   * Prepare calendar app
   */
  const syncAppData = async (): Promise<void> => {
    // Sync calendars
    await CalendarSync.getAll();
    await CalendarSync.syncClientServer();

    // Sync contacts
    await ContactSync.getAndDecryptFromServer();

    await SyncNotification.getAll();

    await getEventsInRange();

    const response: AxiosResponse = await CalendarApi.getCalendarSettings();
    const { data } = response;
    dispatch(setCalendarSettings(data));
    dispatch(
      setDefaultCalendar(
        data.defaultCalendar.id ? data.defaultCalendar.id : data.defaultCalendar
      )
    );

    if (
      data.autoUpdateTimezone ||
      data.defaultTimezone === 'device' ||
      !data.defaultTimezone
    ) {
      const timezone: string = getLocalTimezone();

      dispatch(setDefaultTimezone(timezone));

      await CalendarApi.updateSettings({ key: 'timezone', value: timezone });

      dispatch(updateTimezoneSetting(timezone));
    }
  };

  const initLoad = (): void => {
    if (!checkIfIsSafari()) {
      setServiceWorkerLister();
      subscribeToPush();
    }

    const currentDate: DateTime = setNullTimeInDate(DateTime.local());

    // Set init date range
    const rangeFromInit: string = getDayTimeStart(
      currentDate.minus({ days: 7 })
    );
    const rangeToInit: string = getDayTimeEnd(currentDate.plus({ days: 14 }));

    dispatch(setRangeFrom(rangeFromInit));
    dispatch(setRangeTo(rangeToInit));
  };

  /**
   * Handle first login logic
   */
  const handleFirstLogin = (): void => {
    if (isFirstLogin) {
      dispatch(setIsFirstLogin(false));

      // Load timezones
      setupTimezones();
    }
  };

  useEffect((): void => {
    const currentDate: DateTime = DateTime.local();
    initCalendarAction(dispatch, { calendarView, date: currentDate });

    initLoad();
    handleFirstLogin();
    syncAppData();
  }, []);

  useEffect(() => {
    const currentDate: DateTime = DateTime.local();

    initCalendarAction(dispatch, { calendarView, date: currentDate });
  }, [calendarView]);

  // Redirect to event import
  useEffect(() => {
    if (eventsToImport.length > 2) {
      history.push('/events/import/ics');
    }
  }, [eventsToImport]);

  return <>{props.children}</>;
};

export default CalendarLogic;
