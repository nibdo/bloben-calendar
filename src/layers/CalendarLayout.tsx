import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';

import { MOBILE_MAX_WIDTH } from '../bloben-utils/utils/common';
import {
  setCalendarBodyHeight,
  setCalendarBodyWidth,
  setIsMobile,
} from '../redux/actions';
import {
  CALENDAR_DRAWER_DESKTOP_WIDTH,
  CALENDAR_OFFSET_LEFT,
  HEADER_HEIGHT_BASE,
  HEADER_HEIGHT_BASE_DESKTOP,
  NAVBAR_HEIGHT_BASE,
} from '../components/calendarView/calendar-common';
import { HeightHook, WidthHook } from '../bloben-utils/utils/layout';
import { ReduxState } from '../types/types';

interface CalendarLayout {
  children: any;
}

const CalendarLayout = (props: CalendarLayout) => {
  const dispatch: Dispatch = useDispatch();

  // Hooks
  const height = HeightHook();
  const width = WidthHook();

  const isAppStarting: boolean = useSelector(
    (state: ReduxState): boolean => state.isAppStarting
  );

  /**
   * Set mobile/desktop layout
   */
  useEffect(() => {
    // tslint:disable-next-line:no-magic-numbers
    if (width < MOBILE_MAX_WIDTH) {
      dispatch(setIsMobile(true));
      dispatch(setCalendarBodyWidth(width - CALENDAR_OFFSET_LEFT));
      dispatch(
        setCalendarBodyHeight(height - HEADER_HEIGHT_BASE - NAVBAR_HEIGHT_BASE)
      );
    } else {
      dispatch(setIsMobile(false));
      dispatch(
        setCalendarBodyWidth(
          width - CALENDAR_OFFSET_LEFT - CALENDAR_DRAWER_DESKTOP_WIDTH
        )
      );
      dispatch(setCalendarBodyHeight(height - HEADER_HEIGHT_BASE_DESKTOP));
    }
  }, [width, isAppStarting]);

  return <>{props.children}</>;
};

export default CalendarLayout;
