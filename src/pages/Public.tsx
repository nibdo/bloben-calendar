import { CalDavEvent } from '../types/interface';
import { Context, StoreContext } from '../context/store';
import { GetSharedLinkPublicResponse } from '../../bloben-interface';
import { getHostname } from '../utils/common';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from './NotFound';
import PublicApi from '../api/PublicApi';
import PublicCalendar from '../components/publicCalendar/PublicCalendar';

const getQueryID = () => {
  const query = new URLSearchParams(window.location.search);

  return query.get('id');
};

const Public = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, dispatch]: [StoreContext, any] = useContext(Context);

  const [events, setEvents] = useState<CalDavEvent[]>([]);
  const [settings, setSettings] = useState<GetSharedLinkPublicResponse | null>(
    null
  );
  const [id, setID] = useState<null | string>(null);

  const setContext = (type: string, payload: any) => {
    dispatch({ type, payload });
  };

  useEffect(() => {
    const id = getQueryID();

    setID(id);
  }, []);

  const init = () => {
    const apiUrl = `${getHostname()}/api`;

    window.localStorage.setItem('apiUrl', apiUrl);
    window.env.apiUrl = apiUrl;
  };

  const getCalendars = async () => {
    try {
      const sharedLinkID = id || getQueryID();

      if (sharedLinkID) {
        const responseSharedLink = await PublicApi.getPublicSharedLink(
          sharedLinkID
        );

        if (responseSharedLink.data) {
          setSettings(responseSharedLink.data.settings);
        }

        await PublicApi.getPublicCalendars(sharedLinkID);
      }

      setContext('isAppStarting', false);
    } catch (e: any) {
      setContext('isAppStarting', false);

      if (e.response?.status === 404 || e.response?.status === 403) {
        navigate('/calendar/404');
      }
    }
  };

  useEffect(() => {
    init();
    getCalendars();
  }, []);

  return (
    <div>
      {id && settings ? (
        <PublicCalendar
          sharedID={id}
          events={events}
          setEvents={setEvents}
          settings={settings}
        />
      ) : (
        <NotFoundPage />
      )}
    </div>
  );
};

export default Public;
