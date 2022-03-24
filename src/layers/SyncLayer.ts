import { Context } from '../context/store';
import {
  setCaldavAccounts,
  setCaldavCalendars,
  setCaldavEvents,
  setWebcalCalendars,
} from '../redux/actions';
import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import CalDavAccountApi from '../api/CalDavAccountApi';
import CalDavCalendarApi from '../api/CalDavCalendarApi';
import EventsApi from '../api/EventsApi';
import GeneralApi from '../api/GeneralApi';
import UserEmailConfigApi from '../api/UserEmailConfigApi';
import WebcalCalendarApi from '../api/WebcalCalendarApi';

const SyncLayer = (props: any) => {
  const [, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const dispatch = useDispatch();

  const loadData = async () => {
    const calDavAccountsResponse = await CalDavAccountApi.getCalDavAccounts();
    const calDavCalendarsResponse =
      await CalDavCalendarApi.getCalDavCalendars();
    const calDavEventsResponse = await EventsApi.getCachedEvents();
    const webcalCalendarsResponse =
      await WebcalCalendarApi.getWebcalCalendars();

    dispatch(setCaldavAccounts(calDavAccountsResponse.data));
    dispatch(setCaldavCalendars(calDavCalendarsResponse.data));
    dispatch(setCaldavEvents(calDavEventsResponse.data));
    dispatch(setWebcalCalendars(webcalCalendarsResponse.data));

    try {
      const latestVersionResponse = await GeneralApi.getLatestVersion();
      setContext('latestVersion', latestVersionResponse.data);
      // eslint-disable-next-line no-empty
    } catch (e) {}

    try {
      await GeneralApi.getSync();
      // eslint-disable-next-line no-empty
    } catch (e) {}
    try {
      const emailConfigResponse = await UserEmailConfigApi.get();

      setContext('emailConfig', emailConfigResponse.data);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  return props.children;
};
export default SyncLayer;
