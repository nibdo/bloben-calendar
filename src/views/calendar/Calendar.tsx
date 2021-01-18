import React, { useContext, useEffect, useReducer, useState } from 'react';
import './Calendar.scss';
import StateReducer from '../../utils/state-reducer';
import Utils from './Calendar.utils';
import { Router, useHistory } from 'react-router';
import { HeightHook } from 'bloben-common/utils/layout';
import HeaderCalendar from '../../components/headerCalendar/HeaderCalendar';
import { Route } from 'react-router-dom';
import { Fab, IconButton } from '@material-ui/core';
import EvaIcons from '../../bloben-common/components/eva-icons';
import WeekView from '../../components/calendarView/weekView/WeekView';
import { getDaysNum } from '../../components/calendarView/calendar-common';
import { format } from 'date-fns';
import CalendarDrawer from '../../components/calendarDrawer/CalendarDrawer';
import MonthView from '../../components/calendarView/monthView/MonthView';
import Agenda from '../../components/calendarView/agenda/Agenda';
import CalendarSettings from '../../components/calendarSettings/CalendarSettings';
import { useDispatch, useSelector } from 'react-redux';
import EditEvent from '../../components/event/editEvent/EditEvent';
import CalendarDesktopNavigation from '../../components/CalendarDesktopNavigation/calendar-desktop-navigation';
import AddIcon from '@material-ui/icons/Add';
import BottomSheet from 'bottom-sheet-react';
import Modal from '../../bloben-package/components/modal/Modal';
import CalendarNavbar from '../../components/calendarNavbar/CalendarNavbar';
import { Context } from '../../bloben-package/context/store';
import { parseCssDark } from '../../bloben-common/utils/common';
import Notifications from '../../bloben-package/views/notifications/Notifications';

interface ICalendarTypeProps {
  getNewCalendarDays: any;
  openNewEvent: any;
  changeHeaderTitle: any;
  headerTitle: string;
}
const CalendarType = (props: ICalendarTypeProps) => {
  const {
    getNewCalendarDays,
    openNewEvent,
    changeHeaderTitle,
    headerTitle,
  } = props;

  const [store] = useContext(Context);
  const { isMobile } = store;

  const events: any = useSelector((state: any) => state.events);
  const calendarView: any = useSelector((state: any) => state.calendarView);
  const selectedDate: any = useSelector((state: any) => state.selectedDate);
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const calendars: any = useSelector((state: any) => state.calendars);

  // Get number of days for view
  const daysNum: number = getDaysNum(calendarView);

  return (
    <div className={'full-screen'}>
      {!isMobile && calendarView !== 'agenda' ? (
        <CalendarDesktopNavigation
          title={headerTitle}
          getNewCalendarDays={getNewCalendarDays}
        />
      ) : null}
      {calendarView === 'agenda' ? (
        <Agenda
          changeHeaderTitle={changeHeaderTitle}
          getNewCalendarDays={getNewCalendarDays}
        />
      ) : null}
      {calendarView === 'day' ||
      calendarView === 'week' ||
      calendarView === '3days' ? (
        <WeekView
          daysNum={daysNum}
          openNewEvent={openNewEvent}
          getNewCalendarDays={getNewCalendarDays}
        />
      ) : null}
      {calendarView === 'month' ? (
        <MonthView
          selectedDate={selectedDate}
          calendarDays={calendarDays}
          daysNum={calendarDays.length}
          openNewEvent={openNewEvent}
          data={events}
          calendars={calendars}
          getNewCalendarDays={getNewCalendarDays}
        />
      ) : null}
    </div>
  );
};

interface ICalendarViewProps {
  openNewEvent: any;
  newEventIsOpen: any;
  getNewCalendarDays: any;
  toggleDrawer: any;
  toogleSearch: any;
  isDrawerOpen: any;
  areSettingsOpen: any;
  toggleSettingsOpen: any;
  initCalendar: any;
}
const CalendarView = (props: ICalendarViewProps) => {
  const {
    openNewEvent,
    newEventIsOpen,
    getNewCalendarDays,
    toggleDrawer,
    toogleSearch,
    isDrawerOpen,
    areSettingsOpen,
    toggleSettingsOpen,
    initCalendar,
  } = props;

  const history: any = useHistory();
  const height: any = HeightHook();
  const [store] = useContext(Context);

  const { isDark, isMobile } = store;

  const [headerTitle, setHeaderTitle] = useState('');

  const calendarView: any = useSelector((state: any) => state.calendarView);
  const selectedDate: any = useSelector((state: any) => state.selectedDate);
  const events: any = useSelector((state: any) => state.events);

  const isAgenda: boolean = calendarView === 'agenda';

  const changeHeaderTitle = (value: string) => {
    setHeaderTitle(value);
  };
  useEffect(() => {
    if (!isAgenda) {
      const headerDate: string = format(selectedDate, 'MMMM');
      setHeaderTitle(headerDate);
    }
  }, []);
  useEffect(() => {
    if (!isAgenda) {
      const headerDate: string = format(selectedDate, 'MMMM');
      setHeaderTitle(headerDate);
    }
  }, [selectedDate]);

  return (
    <div
      className={`wrapper ${isDark ? 'dark_background' : 'light_background'}`}
    >
      <div className={'row'}>
        <div className={'calendar__wrapper'}>
          <HeaderCalendar
            children={null}
            title={headerTitle}
            hasHeaderShadow={isAgenda}
            icons={[
              <IconButton key={'bell'} onClick={() => history.push('/calendar/notifications')}>
                <EvaIcons.Bell className={parseCssDark('icon-svg', isDark)} />
              </IconButton>,
            ]}
          />
          <div className={'calendar__row'}>
            {!isMobile ? (
              <CalendarDrawer
                initCalendar={initCalendar}
                handleClose={() => toggleDrawer(false)}
              />
            ) : null}
            {events ? (
              <CalendarType
                headerTitle={headerTitle}
                openNewEvent={openNewEvent}
                getNewCalendarDays={getNewCalendarDays}
                changeHeaderTitle={changeHeaderTitle}
              />
            ) : null}
          </div>
          <Router history={history}>
            <Route path={'/calendar/new/event'}>
              {isMobile ? (
                <Modal {...props} handleClose={() => history.goBack()}>
                  <EditEvent isNewEvent={true} newEventTime={newEventIsOpen} />
                </Modal>
              ) : (
                <Modal {...props} handleClose={() => history.goBack()}>
                  <EditEvent isNewEvent={true} newEventTime={newEventIsOpen} />
                </Modal>
              )}
            </Route>
            <Route path={'/calendar/event/:id'}>
              <Modal {...props} handleClose={() => history.goBack()}>
                <EditEvent isNewEvent={false} />
              </Modal>
            </Route>
            <Route path={'/calendar/notifications'}>
              {isMobile ? (
                  <Modal>
                    <Notifications />
                  </Modal>
              ) : (
                  <Notifications />
              )}
            </Route>
          </Router>

          {isMobile ? (
            <CalendarNavbar
              handleCenterClick={toogleSearch}
              handleLeftClick={toggleDrawer}
              handleRightClick={toggleSettingsOpen}
            />
          ) : null}
          {isDrawerOpen ? (
            <BottomSheet
              {...props}
              backdropClassName={isDark ? 'bottom-sheet__backdrop--dark' : ''}
              containerClassName={isDark ? 'bottom-sheet__container--dark' : ''}
              customHeight={(height / 4) * 3}
              isExpandable={true}
              onClose={() => toggleDrawer(false)}
            >
              <CalendarDrawer handleClose={() => toggleDrawer(false)} />
            </BottomSheet>
          ) : null}
          {areSettingsOpen ? (
            <BottomSheet
              {...props}
              backdropClassName={isDark ? 'bottom-sheet__backdrop--dark' : ''}
              containerClassName={isDark ? 'bottom-sheet__container--dark' : ''}
              isExpandable={false}
              onClose={() => toggleSettingsOpen(false)}
            >
              <CalendarSettings
                  handleClose={() => toggleSettingsOpen(false)}
              />
            </BottomSheet>
          ) : null}
          {calendarView === 'month' ? (
            <div
              style={{
                position: 'absolute',
                bottom: isMobile ? 60 : 34,
                right: isMobile ? 32 : 40,
                zIndex: 2,
              }}
            >
              <Fab
                color="primary"
                aria-label="add"
                onClick={openNewEvent}
                style={{ background: '#d84315' }}
              >
                <AddIcon />
              </Fab>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface ICalendarProps {
  getNewCalendarDays: any;
  initCalendar: any;
}
const Calendar = (props: ICalendarProps) => {
  const history: any = useHistory();
  const [state, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );

  const {
    getNewCalendarDays,
    initCalendar,
  } = props;

  const {
    hasHeaderShadow,
    isScrolling,
    isDrawerOpen,
    typedText,
    results,
    newEventIsOpen,
    areSettingsOpen,
  } = state;

  useEffect(() => {
    setLocalState('selectedDate', 'simple', JSON.stringify(new Date()));
  }, []);

  const setLocalState = (stateName: string, type: string, data: any): void => {
    const payload: any = { stateName, type, data };
    // @ts-ignore
    dispatchState({ state, payload });
  };
  const handleScroll = (e: any) => {
    if (!isScrolling) {
      setLocalState('isScrolling', 'simple', true);
    }
    if (e.target.scrollTop > 0) {
      setLocalState('hasHeaderShadow', 'simple', true);
    } else {
      setLocalState('hasHeaderShadow', 'simple', false);
    }
  };

  const toggleDrawer = (value: boolean) => {
    setLocalState('isDrawerOpen', 'simple', value);
  };
  const toogleSearch = () => {
    history.push('/search');
  };
  const toggleSettingsOpen = (value: boolean) => {
    setLocalState('areSettingsOpen', 'simple', value);
  };
  const openNewEvent = (eventData: any) => {
    setLocalState('newEventIsOpen', 'simple', eventData);
    history.push('/calendar/new/event');
  };

  return (
    <CalendarView
      initCalendar={initCalendar}
      newEventIsOpen={newEventIsOpen}
      openNewEvent={openNewEvent}
      getNewCalendarDays={getNewCalendarDays}
      toggleDrawer={toggleDrawer}
      toogleSearch={toogleSearch}
      isDrawerOpen={isDrawerOpen}
      areSettingsOpen={areSettingsOpen}
      toggleSettingsOpen={toggleSettingsOpen}
    />
  );
};

export default Calendar;
