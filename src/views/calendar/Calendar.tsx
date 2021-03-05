import React, { useContext, useEffect, useReducer, useState } from 'react';
import './Calendar.scss';
import StateReducer from '../../utils/state-reducer';
import Utils from './Calendar.utils';
import { Router, useHistory } from 'react-router';
import { Route } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import BottomSheet from 'bottom-sheet-react';
import { Fab, IconButton } from '@material-ui/core';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';

import { HeightHook } from 'bloben-common/utils/layout';
import HeaderCalendar from '../../components/headerCalendar/HeaderCalendar';
import EvaIcons from '../../bloben-common/components/eva-icons';
import WeekView from '../../components/calendarView/weekView/WeekView';
import { getDaysNum } from '../../components/calendarView/calendar-common';
import CalendarDrawer from '../../components/calendarDrawer/CalendarDrawer';
import MonthView from '../../components/calendarView/monthView/MonthView';
import Agenda from '../../components/calendarView/agenda/Agenda';
import SettingsCalendar from '../../components/settingsCalendar/SettingsCalendar';
import EditEvent from '../event/editEvent/EditEvent';
import CalendarDesktopNavigation from '../../components/CalendarDesktopNavigation/calendar-desktop-navigation';
import Modal from '../../bloben-package/components/modal/Modal';
import CalendarNavbar from '../../components/calendarNavbar/CalendarNavbar';
import { Context } from '../../bloben-package/context/store';
import { parseCssDark } from '../../bloben-common/utils/common';
import Notifications from '../../bloben-package/views/notifications/Notifications';
import EventView from '../event/eventView/EventView';
import { CalendarDays, CalendarView, ReduxState } from '../../types/types';
import {
  CALENDAR_3DAYS_VIEW,
  CALENDAR_AGENDA_VIEW,
  CALENDAR_DAY_VIEW,
  CALENDAR_MONTH_VIEW,
  CALENDAR_WEEK_VIEW,
} from '../../utils/contants';

interface CalendarTypeProps {
  openNewEvent: any;
  changeHeaderTitle: any;
  headerTitle: string;
}
const CalendarType = (props: CalendarTypeProps) => {
  const { openNewEvent, changeHeaderTitle, headerTitle } = props;

  const [store] = useContext(Context);
  const { isMobile } = store;

  const events: any = useSelector((state: ReduxState) => state.events);
  const calendarView: CalendarView = useSelector(
    (state: ReduxState) => state.calendarView
  );
  const calendarDays: CalendarDays = useSelector(
    (state: ReduxState) => state.calendarDays
  );

  // Get number of days for view
  const daysNum: number = getDaysNum(calendarView);

  return (
    <div className={'full-screen'}>
      {!isMobile && calendarView !== CALENDAR_AGENDA_VIEW ? (
        <CalendarDesktopNavigation title={headerTitle} />
      ) : null}
      {calendarView === CALENDAR_AGENDA_VIEW ? (
        <Agenda changeHeaderTitle={changeHeaderTitle} />
      ) : null}
      {calendarView === CALENDAR_DAY_VIEW ||
      calendarView === CALENDAR_WEEK_VIEW ||
      calendarView === CALENDAR_3DAYS_VIEW ? (
        <WeekView daysNum={daysNum} openNewEvent={openNewEvent} />
      ) : null}
      {calendarView === CALENDAR_MONTH_VIEW ? (
        <MonthView
          daysNum={calendarDays.length}
          openNewEvent={openNewEvent}
          data={events}
        />
      ) : null}
    </div>
  );
};

interface CalendarViewProps {
  openNewEvent: any;
  newEventIsOpen: any;
  toggleDrawer: any;
  toogleSearch: any;
  isDrawerOpen: any;
  areSettingsOpen: any;
  toggleSettingsOpen: any;
}
const CalendarViewComponent = (props: CalendarViewProps) => {
  const {
    openNewEvent,
    newEventIsOpen,
    toggleDrawer,
    toogleSearch,
    isDrawerOpen,
    areSettingsOpen,
    toggleSettingsOpen,
  } = props;

  const history: any = useHistory();
  const height: number = HeightHook();
  const [store] = useContext(Context);

  const { isDark, isMobile } = store;

  const [headerTitle, setHeaderTitle] = useState('');

  const calendarView: CalendarView = useSelector(
    (state: any) => state.calendarView
  );
  const selectedDate: DateTime = useSelector(
    (state: any) => state.selectedDate
  );

  const events: any = useSelector((state: any) => state.events);

  const isAgenda: boolean = calendarView === CALENDAR_AGENDA_VIEW;

  const changeHeaderTitle = (value: string) => {
    setHeaderTitle(value);
  };

  useEffect(() => {
    if (!isAgenda) {
      const headerDate: string = selectedDate.toFormat('MMMM');
      setHeaderTitle(headerDate);
    }
  }, []);
  useEffect(() => {
    if (!isAgenda) {
      const headerDate: string = selectedDate.toFormat('MMMM');
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
              <IconButton
                key={'bell'}
                onClick={() => history.push('/notifications')}
              >
                <EvaIcons.Bell className={parseCssDark('icon-svg', isDark)} />
              </IconButton>,
            ]}
          />
          <div className={'calendar__row'}>
            {!isMobile ? (
              <CalendarDrawer handleClose={() => toggleDrawer(false)} />
            ) : null}
            {events ? (
              <CalendarType
                headerTitle={headerTitle}
                openNewEvent={openNewEvent}
                changeHeaderTitle={changeHeaderTitle}
              />
            ) : null}
          </div>
          <Router history={history}>
            <Route path={'/event'}>
              <Modal {...props} handleClose={() => history.goBack()}>
                <EditEvent isNewEvent={true} newEventTime={newEventIsOpen} />
              </Modal>
            </Route>
            <Route path={'/event/:id'}>
              <Modal handleClose={() => history.goBack()}>
                <EventView />
              </Modal>
            </Route>
            <Route path={'/event/edit/:id'}>
              <Modal {...props} handleClose={() => history.goBack()}>
                <EditEvent isNewEvent={false} />
              </Modal>
            </Route>
            <Route path={'/notifications'}>
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
          {isDrawerOpen && isMobile ? (
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
              <SettingsCalendar handleClose={() => toggleSettingsOpen(false)} />
            </BottomSheet>
          ) : null}
          {calendarView === CALENDAR_MONTH_VIEW ? (
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

const CalendarComponent = () => {
  const history: any = useHistory();
  const [state, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );

  const {
    hasHeaderShadow,
    isScrolling,
    isDrawerOpen,
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
    history.push('/event');
  };

  return (
    <CalendarViewComponent
      newEventIsOpen={newEventIsOpen}
      openNewEvent={openNewEvent}
      toggleDrawer={toggleDrawer}
      toogleSearch={toogleSearch}
      isDrawerOpen={isDrawerOpen}
      areSettingsOpen={areSettingsOpen}
      toggleSettingsOpen={toggleSettingsOpen}
    />
  );
};

export default CalendarComponent;
