import React, { useContext, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Redirect, Router, useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';

import Settings from '../views/settings/Settings';
import Search from '../views/search/Search';
import { Context } from 'bloben-package/context/store';
import Modal from 'bloben-package/components/modal/Modal';
import EventImport from '../components/eventImporter/EventImport';
import EventImportButton from '../components/eventImporter/eventImporterButton/EventImportButton';
import EditCalendar from '../views/calendarEdit/editCalendar/EditCalendar';
import { CalendarDays, CalendarView, ReduxState } from '../types/types';
import { CALENDAR_AGENDA_VIEW } from 'utils/contants';
import CalendarComponent from 'views/calendar/Calendar';
import { Calendar } from '../bloben-utils/models/Calendar';

const CalendarRouter = () => {
  const history: any = useHistory();

  const [store] = useContext(Context);
  const { isMobile } = store;

  const calendars: Calendar[] = useSelector(
    (state: ReduxState) => state.calendars
  );

  const calendarView: CalendarView = useSelector(
    (state: ReduxState): CalendarView => state.calendarView
  );
  const calendarDays: CalendarDays = useSelector(
    (state: ReduxState): CalendarDays => state.calendarDays
  );

  const isAppStarting: boolean = useSelector(
    (state: ReduxState): boolean => state.isAppStarting
  );
  const selectedDate: DateTime = useSelector(
    (state: ReduxState): DateTime => state.selectedDate
  );

  const isCalendarReady: boolean =
    (calendarDays &&
      selectedDate &&
      calendarDays.length > 0 &&
      calendars.length > 0) ||
    (selectedDate &&
      calendarView === CALENDAR_AGENDA_VIEW &&
      calendars.length > 0);

  // @ts-ignore
  return !isAppStarting ? (
    <>
      <Router history={history}>
        <Redirect to={'/'} />
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
        <Route path={'/'}>
          {isCalendarReady ? <CalendarComponent /> : null}
        </Route>
        <Route exact path={'/calendar/new'}>
          <Modal>
            <EditCalendar isNewCalendar={true} />
          </Modal>
        </Route>
        <Route exact path={'/calendar/edit/:id'}>
          <Modal>
            <EditCalendar isNewCalendar={false} />
          </Modal>
        </Route>
        <Route path={'/events/import'}>
          <Modal>
            <EventImportButton autoFocus={true} />
          </Modal>
        </Route>
        <Route path={'/events/import/ics'}>
          <Modal>
            <EventImport />
          </Modal>
        </Route>
      </Router>
    </>
  ) : null;
};

export default CalendarRouter;
