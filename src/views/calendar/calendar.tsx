import React, {  useEffect, useReducer, useState } from 'react';
import './calendar.scss';
import StateReducer from '../../utils/state-reducer';
import Utils from './calendar.utils';
import { Router,  useHistory,  } from 'react-router';
import {
  useCurrentHeight, useCurrentWidth,
} from 'bloben-common/utils/layout';
import Navbar from '../../components/navbar';
import Header from '../../components/header';
import Bottomsheet from '../../bloben-package/components/bottomsheet';
import { Route } from 'react-router-dom';
import Modal from '../../bloben-package/components/modal';
import {Fab, IconButton} from '@material-ui/core';
import EvaIcons from '../../bloben-common/components/eva-icons';
import WeekView from '../../components/calendar-view/week-view/week-view';
import {
  CALENDAR_DRAWER_DESKTOP_WIDTH,
  CALENDAR_OFFSET_LEFT,
  getDaysNum,
} from '../../components/calendar-view/calendar-common';
import NewEvent from '../../components/event/new-event/new-event';
import {
  format, formatISO,
} from 'date-fns';
import CalendarDrawer from '../../components/calendar-drawer/calendar-drawer';
import MonthView from '../../components/calendar-view/month-view/month-view';
import Agenda from '../../components/calendar-view/agenda/agenda';
import CalendarSettings from '../../components/calendar-settings/calendar-settings';
import { v4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import EditEvent from '../../components/event/edit-event/edit-event';
import { selectEvent } from '../../redux/actions';
import WebAuthn from '../../service/WebAuthn';
import CalendarDesktopNavigation
  from '../../components/CalendarDesktopNavigation/calendar-desktop-navigation';
import AddIcon from "@material-ui/icons/Add";
import Slider from "react-slick";

const CalendarType = (props: any) => {
  const {
    getNewCalendarDays,
    prevCalendarDays,
    nextCalendarDays,
    openNewEvent,
    changeHeaderTitle,
    mappedCalendars,
    headerTitle,
  } = props;
  const events: any = useSelector((state: any) => state.events);
  const calendarView: any = useSelector((state: any) => state.calendarView);
  const selectedDate: any = useSelector((state: any) => state.selectedDate);
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const calendars: any = useSelector((state: any) => state.calendars);
  const isMobile: boolean = useSelector((state: any) => state.isMobile);

  // Get number of days for view
  const daysNum: number = getDaysNum(calendarView);

  return (
    <div className={'full-screen'}>
      {!isMobile && calendarView !== 'agenda' ? <CalendarDesktopNavigation title={headerTitle} getNewCalendarDays={getNewCalendarDays}/> : null}
      {calendarView === 'agenda' ? (
        <Agenda
          openNewEvent={openNewEvent}
          mappedCalendars={mappedCalendars}
          changeHeaderTitle={changeHeaderTitle}
          getNewCalendarDays={getNewCalendarDays}
        />
      ) : null}
      {calendarView === 'day' || calendarView === 'week' || calendarView === '3days' ? (
        <WeekView
          selectedDate={selectedDate}
          nextCalendarDays={nextCalendarDays}
          prevCalendarDays={prevCalendarDays}
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

const CalendarView = (props: any) => {
  const {
    prevCalendarDays,
    nextCalendarDays,
    openNewEvent,
    newEventIsOpen,
    getNewCalendarDays,
    data,
    toggleDrawer,
    toogleSearch,
    isDrawerOpen,
    mappedCalendars,
    areSettingsOpen,
    toggleSettingsOpen,
    allDays,
    initCalendar
  } = props;
  const selectedEvent: any = useSelector((state: any) => state.selectedEvent);
  const dispatch: any = useDispatch();
  const history: any = useHistory();
  const [headerTitle, setHeaderTitle] = useState('');

  const isMobile: boolean = useSelector((state: any) => state.isMobile);
  const isDark: boolean = useSelector((state: any) => state.isDark);

  const height: any = useCurrentHeight();
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
      className={`wrapper ${
        isDark ? 'dark_background' : 'light_background'
      }`}
    >
      <div className={'row'}>
        <div className={'calendar__wrapper'}>
          <Header
            title={headerTitle}
            hasHeaderShadow={isAgenda}
            icons={[
              // <IconButton onClick={() => toggleDrawer(true)}>
              //   <EvaIcons.Menu className={'icon-svg'} />
              // </IconButton>,
              <IconButton key={'bell'} onClick={() => WebAuthn.register()}>
                <EvaIcons.Bell className={'icon-svg'} />
                {/*<Dropdown isOpen={true} values={['day', 'week']} />*/}
              </IconButton>,
            ]}
            searchIsOpen={false}
          />
          <div className={'calendar__row'}>
            {!isMobile ? <CalendarDrawer
                initCalendar={initCalendar}
                handleCloseModal={() => toggleDrawer(false)}
            /> : null }
          {events ? (
            <CalendarType
                headerTitle={headerTitle}
              prevCalendarDays={prevCalendarDays}
              nextCalendarDays={nextCalendarDays}
              openNewEvent={openNewEvent}
              getNewCalendarDays={getNewCalendarDays}
              mappedCalendars={mappedCalendars}
              changeHeaderTitle={changeHeaderTitle}
              allDays={allDays}
            />
          ) : null}
          </div>
          <Router history={history}>
            <Route path={'/new/event'}>
              {isMobile ? <Modal
                      {...props}
                      handleCloseModal={() => history.goBack()}
                  ><EditEvent
                      isNewEvent={true}
                      newEventTime={newEventIsOpen}
                  />
                  </Modal>
                  : <Modal>
                    <EditEvent
                        isNewEvent={true}
                        newEventTime={newEventIsOpen}
                    />
                  </Modal>
              }
            </Route>
            <Route path={'/event/:id'}>
              <Modal
                  {...props}
                  handleCloseModal={() => history.goBack()}
              >
                <EditEvent
                    isNewEvent={false}
                />
              </Modal>
            </Route>
        </Router>

        {isMobile ? (
            <Navbar
              handleCenterClick={toogleSearch}
              handleLeftClick={toggleDrawer}
              handleRightClick={toggleSettingsOpen}
            />
          ) : null}
          {isDrawerOpen ? (
            <Bottomsheet
              {...props}
              customHeight={(height / 4) * 3}
              isExpandable={true}
              handleCloseModal={() => toggleDrawer(false)}
            >
              <CalendarDrawer
                handleCloseModal={() => toggleDrawer(false)}
              />
            </Bottomsheet>
          ) : null}
          {areSettingsOpen ? (
            <Bottomsheet
              {...props}
              isExpandable={false}
              handleCloseModal={() => toggleSettingsOpen(false)}
            >
              <CalendarSettings
                handleCloseModal={() => toggleSettingsOpen(false)}
              />
            </Bottomsheet>
          ) : null}
          {calendarView === 'month' ?
          <div style={{ position: 'absolute', bottom: isMobile ? 60 : 34, right: isMobile ? 32 : 40, zIndex: 2, }}>
            <Fab color="primary" aria-label="add" onClick={openNewEvent} style={{ background: '#d84315'}}>
              <AddIcon />
            </Fab>
          </div>
              : null}
        </div>
      </div>
    </div>
  );
};

const Calendar = (props: any) => {
  const history: any = useHistory();
  const [state, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );

  const {
    getNewCalendarDays,
    prevCalendarDays,
    allDays,
    nextCalendarDays,
    initCalendar
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
    history.push('/search')
  };
  const toggleSettingsOpen = (value: boolean) => {
    setLocalState('areSettingsOpen', 'simple', value);
  };
  const openNewEvent = (eventData: any) => {
    setLocalState('newEventIsOpen', 'simple', eventData);
    history.push('/new/event')
  };
  // const mappedCalendarsData: any = mapCalendarColors(calendars);

  return (
    <CalendarView
        initCalendar={initCalendar}
      handleScroll={handleScroll}
      hasHeaderShadow={hasHeaderShadow}
      isScrolling={isScrolling}
      typedText={typedText}
      results={results}
      prevCalendarDays={prevCalendarDays}
      nextCalendarDays={nextCalendarDays}
      newEventIsOpen={newEventIsOpen}
      openNewEvent={openNewEvent}
      data={props.events}
      events={props.events}
      getNewCalendarDays={getNewCalendarDays}
      toggleDrawer={toggleDrawer}
      toogleSearch={toogleSearch}
      isDrawerOpen={isDrawerOpen}
      // mappedCalendars={mappedCalendarsData}
      areSettingsOpen={areSettingsOpen}
      toggleSettingsOpen={toggleSettingsOpen}
      allDays={allDays}
    />
  );
};

export default Calendar;
