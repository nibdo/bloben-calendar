import '../button/buttonBase/ButtonBase.scss';
import '../calendar/Calendar.scss';
import 'kalend/dist/styles/index.css';
import { CALENDAR_VIEW } from 'kalend/common/enums';
import { CalDavEvent, QueryRange, ReduxState } from '../../types/interface';
import { Context, StoreContext } from '../../context/store';
import { DateTime } from 'luxon';
import { EVENT_TYPE } from '../../enums';

import { SOURCE_TYPE } from '../../bloben-interface/enums';
import { SettingsLocal } from '../../redux/reducers/settingsLocal';
import { TOAST_STATUS } from '../../types/enums';
import { createToast, getSyncRange, parseCssDark } from '../../utils/common';
import { setCalendarDaysRange, setLocalSettings } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useWidth } from '../../utils/layout';
import BottomSheetMobile from '../bottomSheetMobile/BottomSheetMobile';
import CalendarHeader from '../calendar/CalendarHeader';
import DrawerDesktop from '../drawerDesktop/DrawerDesktop';
import EventView from '../../views/event/eventView/EventView';
import EventsApi from '../../api/EventsApi';
import Kalend, {
  CalendarEvent,
  OnEventClickData,
  OnNewEventClickData,
} from 'kalend';
import MobileNavbar from '../mobileNavbar/MobileNavbar';
import PublicApi from '../../api/PublicApi';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SearchModal from '../searchModal/SearchModal';
import Settings from '../../pages/settings/Settings';

const parseCalendarView = (view: string) => {
  switch (view) {
    case CALENDAR_VIEW.DAY.toString():
      return CALENDAR_VIEW.DAY;
    case CALENDAR_VIEW.AGENDA.toString():
      return CALENDAR_VIEW.AGENDA;
    case CALENDAR_VIEW.THREE_DAYS.toString():
      return CALENDAR_VIEW.THREE_DAYS;
    case CALENDAR_VIEW.WEEK.toString():
      return CALENDAR_VIEW.WEEK;
    case CALENDAR_VIEW.MONTH.toString():
      return CALENDAR_VIEW.MONTH;
    default:
      return CALENDAR_VIEW.WEEK;
  }
};

const parseHourHeight = (hourHeightSetting: number): number => {
  const element = document.querySelector('.Kalend__Calendar__table');
  if (!element) {
    return hourHeightSetting;
  }

  const rect = element.getBoundingClientRect();

  const maxHourHeight = hourHeightSetting * 24;

  if (rect.height > maxHourHeight) {
    return rect.height / 21;
  }

  return hourHeightSetting;
};

interface PublicCalendarProps {
  events: CalDavEvent[];
  setEvents: any;
  sharedID: string;
  settings: any;
}
const PublicCalendar = (props: PublicCalendarProps) => {
  const toast = useToast();
  const navigate = useNavigate();

  const { events, setEvents, sharedID, settings } = props;
  const settingsLocal: SettingsLocal = useSelector(
    (state: ReduxState) => state.settingsLocal
  );

  const kalendRef: any = useRef();
  const [selectedView, setSelectedView] = useState<CALENDAR_VIEW>(
    settings.defaultView
  );
  const [selectedDate, setSelectedDate] = useState(
    DateTime.now().toFormat('MMMM yyyy')
  );

  const dispatch = useDispatch();

  const [isEventViewOpen, setEventViewOpen] = useState<any>(null);
  const [isNewEventOpen, setIsNewEventOpen] = useState<any>(null);
  const [isBottomSheetOpen, openBottomSheet] = useState<any>(false);
  const [currentE, setCurrentE] = useState<any>(null);
  const [searchModalOpen, openSearchModal] = useState(false);

  const kalendState: any = useRef({});

  // query params
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const view = query.get('view');

    if (view) {
      const parsedView = parseCalendarView(view);
      setSelectedView(parsedView);

      // replace query param
      if (parsedView !== view) {
        navigate(`${window.location.pathname}?view=${parsedView}`);
      }
    }
  }, []);

  const hasEmailConfigRef = useRef(false);

  const [store]: [StoreContext] = useContext(Context);

  useEffect(() => {
    hasEmailConfigRef.current =
      store?.emailConfig?.hasSystemConfig ||
      store?.emailConfig?.hasCustomConfig;
  }, [JSON.stringify(store.emailConfig)]);

  const handleSyncWithRange = async () => {
    const range: QueryRange = getSyncRange(
      'Monday',
      kalendState?.current?.selectedDate || DateTime.now().toUTC().toString()
    );

    const rangeEventsResponse = await PublicApi.getPublicEvents(
      sharedID,
      kalendState?.current?.range?.rangeFrom || range.rangeFrom,
      kalendState?.current?.range?.rangeTo || range.rangeTo
    );

    toast.closeAll();

    setEvents(rangeEventsResponse?.data);
  };

  useEffect(() => {
    handleSyncWithRange();
  }, []);

  const openNewEvent = (eventData: OnNewEventClickData, e: any) => {
    setIsNewEventOpen(eventData);
    setCurrentE(e);
  };

  const handleEventClick = (data: OnEventClickData, e: any) => {
    setEventViewOpen(data);
    setCurrentE(e);
  };

  const closeEventView = () => {
    setEventViewOpen(null);
  };

  const onPageChange = async () => {
    handleSyncWithRange();
  };

  const onKalendStateChange = (data: any) => {
    // workaround for navigating to day view internal
    if (data.calendarDays.length === 1) {
      setSelectedView(CALENDAR_VIEW.DAY);
    }

    dispatch(setCalendarDaysRange(data.range));
    kalendState.current = data;
    setSelectedDate(
      DateTime.fromISO(kalendState?.current?.selectedDate).toFormat('MMMM yyyy')
    );
  };

  const handleRefresh = async () => {
    handleSyncWithRange();
  };

  const handleOpenDrawer = () => {
    dispatch(
      setLocalSettings({
        drawerOpen: !settingsLocal.drawerOpen,
      })
    );
  };

  const width = useWidth();

  const handleSearchClick = async (
    id: string,
    type: SOURCE_TYPE,
    isDark: boolean
  ) => {
    try {
      const response = await EventsApi.getEvent(id, type, isDark);

      if (response.data) {
        handleEventClick(response.data as unknown as CalendarEvent, null);
      }
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }

    openSearchModal(false);
  };

  return (
    <div className={'Main__content__row'}>
      {settingsLocal.drawerOpen ? <DrawerDesktop /> : null}
      <div
        className={parseCssDark(
          `Calendar_container${settingsLocal.drawerOpen ? '-collapsed' : ''}`,
          store.isDark
        )}
        style={{
          width: settingsLocal.drawerOpen ? width - 200 : width,
        }}
      >
        <CalendarHeader
          kalendRef={kalendRef}
          selectedDate={selectedDate}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          handleRefresh={handleRefresh}
          handleOpenDrawer={handleOpenDrawer}
          openSearchModal={() => openSearchModal(true)}
          isPublic={true}
        />
        {selectedView ? (
          <Kalend
            kalendRef={kalendRef}
            onEventClick={handleEventClick}
            onNewEventClick={openNewEvent}
            events={events as any}
            initialDate={new Date().toISOString()}
            hourHeight={parseHourHeight(settings.hourHeight)}
            timeFormat={settings.timeFormat.toString()}
            weekDayStart={settings.startOfWeek}
            initialView={settings.defaultView}
            disabledDragging={true}
            // disabledViews={settings.disabledViews}
            draggingDisabledConditions={{
              type: EVENT_TYPE.WEBCAL,
            }}
            // onSelectView={() => {}}
            onPageChange={onPageChange}
            disableMobileDropdown={true}
            // calendarIDsHidden={settings.hiddenCalendarIDs}
            onStateChange={onKalendStateChange}
            selectedView={selectedView || settings.defaultView}
            isNewEventOpen={isNewEventOpen !== null}
            showTimeLine={true}
            timezone={settings.timezone}
            showWeekNumbers={false}
            autoScroll={true}
            isDark={store.isDark}
          />
        ) : null}

        {isEventViewOpen ? (
          <EventView
            data={isEventViewOpen}
            handleClose={closeEventView}
            openEditEventModal={null}
            currentE={currentE}
            disabledEdit={true}
          />
        ) : null}
        {store.isMobile ? (
          <MobileNavbar
            openBottomSheet={() => openBottomSheet(true)}
            kalendRef={kalendRef}
          />
        ) : null}
        {store.isMobile && isBottomSheetOpen ? (
          <BottomSheetMobile
            isBottomSheetOpen={isBottomSheetOpen}
            onClose={() => openBottomSheet(false)}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
          />
        ) : null}

        {searchModalOpen ? (
          <SearchModal
            handleClose={() => openSearchModal(false)}
            handleClick={handleSearchClick}
            sharedCalendarID={sharedID}
          />
        ) : null}
      </div>
      <Settings isPublic={true} />
    </div>
  );
};

export default PublicCalendar;
