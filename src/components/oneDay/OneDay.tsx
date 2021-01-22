import React, { useContext, useEffect } from 'react';
import './OneDay.scss';
import {
  getYear,
  getMonth,
  getDate,
  isSameDay,
  differenceInMinutes,
  differenceInCalendarDays,
} from 'date-fns';

import { WidthHook } from 'bloben-common/utils/layout';
import CalendarEvent from '../event/calendarEvent/CalendarEvent';
import { useSelector } from 'react-redux';
import { parseCssDark } from '../../bloben-common/utils/common';
import { checkOverlappingEvents } from '../../utils/common';
import { Context } from '../../bloben-package/context/store';
import { DateTime } from 'luxon';
import LuxonHelper from '../../bloben-package/utils/LuxonHelper';

const renderEvents = (
  props: any,
  dataset: any,
  baseWidth: number,
  isDark: any,
  calendars: any
) => {
  let offsetCount: any = []; //Store every event id of overlapping items
  let offsetCountFinal: any; //Sort events by id number
  const tableWidth: number = baseWidth / props.daysNum;
  if (dataset) {
    // Filter all day events and multi day events
    return dataset
      .filter(
        (item: any) =>
          !item.allDay &&
            DateTime.fromISO(item.endAt).diff(DateTime.fromISO(item.startAt), 'days').toObject().days === 0
      )
      .map((event: any) => {
        let width = 1; //Full width
        let offsetLeft = 0;

        // Compare events
        dataset.forEach((item2: any) => {
          if (event.id !== item2.id && !item2.allDay) {
            if (
              checkOverlappingEvents(event, item2) &&
                DateTime.fromISO(item2.endAt).diff(DateTime.fromISO(item2.startAt), 'days').toObject().days === 0
            ) {
              width = width + 1; //add width for every overlapping item
              offsetCount.push(item2.id); // set offset for positioning
              offsetCount.push(event.id); // set offset for positioning
            }
          }
        });

        //sort items for proper calculations of offset by id
        // prevent different order in loop
        if (offsetCount.length > 0) {
          offsetCountFinal = offsetCount.sort();
        }

        if (offsetCountFinal) {
          offsetLeft =
            (tableWidth / offsetCountFinal.length) *
            offsetCountFinal.indexOf(event.id); //count offset
        }

        const calendarColor: string = event.color;

        // @ts-ignore
        const offsetTop: any = DateTime.fromISO(event.startAt).diff(DateTime.fromISO(event.startAt).set({ hour: 0, minute: 0, second: 0})).toObject().minutes / 1.5;
        const eventHeight: any =
          event.endAt.diff(event.startAt, 'minutes').toObject().minutes / 1.5;
        const eventWidth: any = tableWidth / width - 1; ///event.width.toString() + "%"
        //event.left
        // Current status: events is displayed in wrong place
        offsetCount = [];
        offsetCountFinal = '';

        return (
          <CalendarEvent
            isDark={isDark}
            key={event.id}
            index={props.index}
            eventHeight={eventHeight}
            offsetTop={offsetTop}
            eventWidth={eventWidth}
            offsetLeft={offsetLeft}
            colorName={calendarColor}
            event={event}
          />
        );
      });
  }
};

interface ITimeNowLineProps {
  daysNum: number;
  nowPosition: any;
}
const TimeNowLine = (props: ITimeNowLineProps) => {
  const calendarBodyWidth: number = useSelector(
    (state: any) => state.calendarBodyWidth
  );

  const { daysNum, nowPosition } = props;
  const lineStyle: any = {
    top: nowPosition,
    width: calendarBodyWidth / daysNum,
  };

  return (
    <div id={'time-now'} className={'one_day__time-now'} style={lineStyle} />
  );
};

interface IOneDayProps {
  key: string;
  daysNum: number;
  day: any;
  index: number;
  showNewEvent: any;
  data: any;
}
const OneDay = (props: IOneDayProps) => {
  const { daysNum, day, index, showNewEvent, data } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const calendars: any = useSelector((state: any) => state.calendars);
  const calendarBodyWidth: number = useSelector(
    (state: any) => state.calendarBodyWidth
  );

  const handleEventClick = (event: any) => {
    const rect: any = event.target.getBoundingClientRect();
    const y: any = event.clientY - rect.top;
    // Get hour from click event
    const hour: number = y / 40;
    showNewEvent({ day, hour, event });
  };

  const oneDay: any = {
    width: calendarBodyWidth / daysNum,
    height: 24 * 40,
    position: 'relative',
    flexDirection: 'column',
  };
  const isToday: any = LuxonHelper.isToday(day);
  const isFirstDay: any = index === 0;
  const dataForDay: any = data;

  const eventNodes: any = renderEvents(
    props,
    dataForDay,
    calendarBodyWidth,
    isDark,
    calendars
  );
  const dateNow: any = DateTime.local();


  const nowPosition: number = dateNow.diff(DateTime.local().set({ hour: 0, minute: 0, second: 0}), 'minutes').toObject().minutes / 1.5

  useEffect(() => {
    if (isToday) {
      const elements: any = document.querySelectorAll(
        '.calendar-body__wrapper'
      );

      for (const element of elements) {
        element.scrollTo({ top: nowPosition - 40, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div
      key={day.toString()}
      style={oneDay}
      className={
        !isFirstDay ? parseCssDark('one-day__border-left', isDark) : ''
      }
      onClick={handleEventClick}
    >
      {dataForDay && dataForDay.length > 0 ? eventNodes : null}

      {isToday ? (
        <TimeNowLine
          daysNum={daysNum}
          nowPosition={nowPosition}
        />
      ) : null}
    </div>
  );
};

export default OneDay;
