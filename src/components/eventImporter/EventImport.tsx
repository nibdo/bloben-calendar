import React, { useContext, useEffect, useState } from 'react';
import './EventImport.scss';
import '../settingsCalendar/SettingsCalendar.scss';
import IcsParser from '../../utils/IcsParser';
import { useDispatch, useSelector } from 'react-redux';
import { renderAgendaEvents } from '../calendarView/agenda/Agenda';
import {
  cloneDeep,
  findInArrayById,
  mapEventsToDates,
} from '../../utils/common';
import {
  sendWebsocketMessage,
  WEBSOCKET_IMPORT_EVENTS,
} from '../../api/calendar';
import { useHistory } from 'react-router-dom';
import { setEventsToImport } from '../../redux/actions';
import { useHeight, HeaderModal, Modal } from 'bloben-react';
import { CalendarRow } from '../../views/event/eventDetail/EventDetail';
import { Context } from 'bloben-module/context/store';
import { User, EventEncrypted, encryptEvent } from 'bloben-utils';

interface ResultsProps {
  results: any;
}
const Results = (props: ResultsProps) => {
  const { results } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const height: number = useHeight() - 56;

  const emptyFunc: any = () => {};

  const renderedResults: any = renderAgendaEvents(
    results,
    isDark,
    emptyFunc,
    emptyFunc,
    true
  );

  return (
    <div
      className={'search__container-results'}
      style={{ height, width: '100%' }}
    >
      {renderedResults}
    </div>
  );
};

interface ImportedEventsProps {
  data: any;
  handleSave: any;
  clearData: any;
  calendar: any;
  changeCalendar: any;
  coordinates: any;
  setCoordinates: any;
  selectCalendar: any;
}
const ImportedEvents = (props: ImportedEventsProps) => {
  const { data, handleSave, clearData, calendar, selectCalendar } = props;

  const [store] = useContext(Context);

  const { isDark, isMobile } = store;

  return (
    <Modal handleClose={clearData} isDark={isDark}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        <HeaderModal
          isDark={isDark}
          isMobile={isMobile}
          title={'Import events'}
          handleSave={handleSave}
          onClose={clearData}
        />
        <CalendarRow calendar={calendar} selectCalendar={selectCalendar} />
        <Results results={data} />
      </div>
    </Modal>
  );
};

const EventImport = () => {
  const history: any = useHistory();
  const dispatch: any = useDispatch();

  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const user: User = useSelector((state: any) => state.user);
  const calendars: any = useSelector((state: any) => state.calendars);

  const eventsToImport: string = useSelector(
    (state: any) => state.eventsToImport
  );

  const [data, setData] = useState(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [calendar, setCalendar] = useState(null);

  const handleSave = async () => {
    const body: any = [];

    if (data) {
      // @ts-ignore
      for (const [key, value] of Object.entries(data)) {
        for (const item of value as any) {
          // Encrypt data
          const bodyToSend: EventEncrypted = await encryptEvent(
            user.publicKey,
            item
          );

          // Save to redux store
          // dispatch(mergeEvent(simpleObj));

          body.push(bodyToSend);
        }
      }
    }

    sendWebsocketMessage(WEBSOCKET_IMPORT_EVENTS, body);
    dispatch(setEventsToImport(''));
    history.push('/');
  };

  /**
   * Handle file select
   * @param fileString
   */
  const onLoad = (fileString: string) => {
    if (fileString.length < 2) {
      return;
    }

    // Parse string ics events to obj
    const parsedEvents: any = IcsParser.parseFile(fileString);

    if (!calendar) {
      setCalendar(calendars[0]);
    }

    const enhancedEvents: any = IcsParser.enhanceParsedEvent(
      parsedEvents,
      calendar ? calendar : calendars[0]
    );

    const result: any = mapEventsToDates(enhancedEvents);

    setData(result);
  };

  const selectCalendar = (calendarObj: any) => {
    setCalendar(calendarObj.id);
  };

  const changeCalendar = async (itemName: string, calendarId: string) => {
    const calendarSelected: any = await findInArrayById(calendars, calendarId);

    setCalendar(calendarSelected);

    // @ts-ignore
    const result: any = cloneDeep(data);

    for (const [key, value] of Object.entries(data as any)) {
      for (const item of value as any) {
        item.calendarId = calendarId;
        item.color = calendarSelected.color;
      }
    }

    setData(result);
  };
  const clearData = () => {
    setData(null);
    history.push('/');
  };

  /**
   * Click listener to set coordinates for dropdowns
   * @param e
   */
  const handleNewCoordinates = (e: any) => {
    const rect: any = e.target.getBoundingClientRect();
    setCoordinates({ x: rect.x, y: rect.y });
  };

  useEffect(() => {
    setCalendar(calendars[0]);

    if (eventsToImport.length > 2) {
      onLoad(eventsToImport);
    }

    document.addEventListener('click', handleNewCoordinates);

    return () => {
      document.removeEventListener('click', handleNewCoordinates);
      // Clear events to import
      dispatch(setEventsToImport(''));
    };
  }, []);

  return data && calendar ? (
    <ImportedEvents
      data={data}
      handleSave={handleSave}
      clearData={clearData}
      changeCalendar={changeCalendar}
      coordinates={coordinates}
      setCoordinates={setCoordinates}
      calendar={calendar}
      selectCalendar={selectCalendar}
    />
  ) : null;
};

export default EventImport;
