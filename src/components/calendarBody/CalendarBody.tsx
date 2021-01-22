import React, { useContext } from 'react';
import './CalendarBody.scss';
import OneDay from '../oneDay/OneDay';
import {
  CALENDAR_OFFSET_LEFT,
  formatTimestampToDate,
  hoursArrayString,
} from '../calendarView/calendar-common';
import { WidthHook } from 'bloben-common/utils/layout';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { parseCssDark } from '../../bloben-common/utils/common';
import { Context } from '../../bloben-package/context/store';
import { DateTime } from 'luxon';

const renderOneDay = (
  calendarDays: DateTime[],
  daysNum: number,
  showNewEvent: any,
  events: any
) =>
  calendarDays.map((day: DateTime, index: number) => {
    const formattedDayString: string = formatTimestampToDate(day);

    return (
      <OneDay
        key={day.toString()}
        day={day}
        index={index}
        data={events ? events[formattedDayString] : []}
        showNewEvent={showNewEvent}
        daysNum={daysNum}
      />
    );
  });

interface IHoursTextProps {
  width: number;
}
const HoursText = (props: IHoursTextProps) => {
  const { width } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const renderHours = () =>
    hoursArrayString.map((hour: any) =>
      hour === '00' || hour === '24' ? null : (
        <div key={hour} className={'one_day__hours_container'}>
          <p className={parseCssDark('one_day__hours_text', isDark)}>{hour}</p>
          <div
            className={parseCssDark('one_day__hours-line', isDark)}
            style={{ width: width - 15 }}
          />
        </div>
      )
    );

  const hours: any = renderHours();

  return hours;
};

interface ICalendarBodyProps {
  openNewEvent: any;
  index: number;
  daysNum: number;
}
const CalendarBody = (props: ICalendarBodyProps) => {
  const { openNewEvent, index, daysNum } = props;

  const [store] = useContext(Context);
  const { isMobile } = store;

  const calendarDays: DateTime[][] = useSelector(
    (state: any) => state.calendarDays
  );
  const calendarBodyWidth: number = useSelector(
    (state: any) => state.calendarBodyWidth
  );
  const calendarBodyHeight: number = useSelector(
    (state: any) => state.calendarBodyHeight
  );
  const calendarDaysCurrentIndex: number = useSelector(
    (state: any) => state.calendarDaysCurrentIndex
  );
  const events: any = useSelector((state: any) => state.events);

  const width: number = WidthHook();
  const days: any = renderOneDay(
    calendarDays[index],
    daysNum,
    openNewEvent,
    events
  );

  const style: any = {
    paddingLeft: CALENDAR_OFFSET_LEFT,
    width: calendarBodyWidth,
    height: calendarBodyHeight,
  };


  /**
   * Adjust scroll position for all screens
   * @param currentIndex
   */
  const setCurrentOffset = (currentIndex: number): void => {
    // Skip screens outside view
    if (currentIndex !== calendarDaysCurrentIndex) {
      return;
    }

    const currentElement: any = document.getElementById(
      `timetable_${currentIndex}`
    );

    let currentOffset: number;

    // Have to set middle clone for last screen manually to get correct current offset
    if (currentIndex === 2) {
      const currentElements: any = document.querySelectorAll(
        `#timetable_${currentIndex}`
      );
      currentOffset = currentElements[1].scrollTop;
    } else {
      currentOffset = currentElement.scrollTop;
    }

    // Need to select with query selector as byId doesn't select clones
    const elements: any = document.querySelectorAll('.calendar-body__wrapper');

    for (const element of elements) {
      element.scrollTop = currentOffset;
    }
  };

  // Debounce scroll function
  // Turn off for desktop layout as there is just one active screen
  const handleScroll = _.debounce(() => {
    if (!isMobile) {
      return;
    }
    setCurrentOffset(index);
  }, 50);

  return (
    <div
      style={style}
      className={'calendar-body__wrapper'}
      id={`timetable_${index}`}
      onScroll={handleScroll}
    >
      <div
        className={'one_day__hours_wrapper'}
        style={{ height: calendarBodyHeight }}
      >
        <HoursText width={width} />
      </div>
      {days}
    </div>
  );
};

export default CalendarBody;
