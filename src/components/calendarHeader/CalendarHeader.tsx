import React, { useContext } from 'react';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import './CalendarHeader.scss';
import { WidthHook } from 'bloben-common/utils/layout';
import {
  CALENDAR_DRAWER_DESKTOP_WIDTH,
  CALENDAR_OFFSET_LEFT,
  calendarColors,
  daysText,
} from '../calendarView/calendar-common';
import { parseCssDark } from '../../bloben-common/utils/common';
import { checkOverlappingEvents } from '../../utils/common';
import { Context } from '../../bloben-package/context/store';
import LuxonHelper from '../../bloben-utils/utils/LuxonHelper';
import { parseToDateTime } from '../../bloben-package/utils/datetimeParser';
import { formatTimestampToDate } from '../../bloben-utils/utils/common';
import { CalendarDays, CalendarView, ReduxState } from '../../types/types';
import { CALENDAR_DAY_VIEW, CALENDAR_MONTH_VIEW } from '../../utils/contants';

interface EventHeaderProps {
  calendarColor: string;
  eventWidth: number;
  offsetLeft: number;
  event: any;
  isDark: boolean;
}
const EventHeader = (props: EventHeaderProps) => {
  const { calendarColor, eventWidth, offsetLeft, event, isDark } = props;

  const history: any = useHistory();

  const style: any = {
    width: eventWidth,
    borderColor: calendarColor,
    borderRadius: 4,
    background: /*dragging ? 'blue' : */ calendarColor,
    left: offsetLeft,
  };

  const handleEventSelect = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/event/${event.id}`);
  };

  return (
    <div
      className={'event_header__container'}
      style={style}
      onClick={handleEventSelect}
    >
      <p className={`event_header__text${isDark ? '--dark' : ''}`}>
        {event.summary}{' '}
      </p>
    </div>
  );
};

interface DaysTextProps {
  daysNum: number;
  days: any;
  width: number;
}
/**
 * Render text representation of days
 *
 * @param props
 * @constructor
 */
const DaysText = (props: DaysTextProps) => {
  const { daysNum, days, width } = props;

  const calendarView: CalendarView = useSelector(
    (state: ReduxState) => state.calendarView
  );
  const calendarBodyWidth: number = useSelector(
    (state: ReduxState) => state.calendarBodyWidth
  );

  const [store] = useContext(Context);
  const { isMobile } = store;

  const isMonthView: boolean = calendarView === CALENDAR_MONTH_VIEW;

  const colWidth: number = isMonthView
    ? (isMobile ? width : width - CALENDAR_DRAWER_DESKTOP_WIDTH) / daysNum
    : calendarBodyWidth / daysNum;

  const renderDaysText = () => {
    const dayTextColumnWidth: any = {
      width: colWidth,
    };

    if (isMonthView) {
      return days.map((day: string) => (
        <div
          key={day.toString()}
          className={'header_calendar_days__col'}
          style={dayTextColumnWidth}
        >
          <p className={'header_calendar_days__text'}>{day}</p>
        </div>
      ));
    }

    return days.map((day: DateTime) => (
      <div
        key={day.toString()}
        className={'header_calendar_days__col'}
        style={dayTextColumnWidth}
      >
        <p className={'header_calendar_days__text'}>{day.toFormat('EEE')}</p>
      </div>
    ));
  };
  const namesForDays: any = renderDaysText();

  return (
    <div className={'header_calendar_days__wrapper'}>
      <div className={'header_calendar_days__container'}>{namesForDays}</div>
    </div>
  );
};

interface DaysNumericProps {
  daysNum: number;
  index: number;
}
/**
 * Get numeric representation of days
 *
 * @param props
 * @constructor
 */
const DaysNumeric = (props: DaysNumericProps) => {
  const [store] = useContext(Context);
  const { isDark } = store;

  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const selectedDate: DateTime = useSelector(
    (state: any) => state.selectedDate
  );
  const calendarView: string = useSelector((state: any) => state.calendarView);

  const calendarBodyWidth: number = useSelector(
    (state: any) => state.calendarBodyWidth
  );
  const { daysNum, index } = props;

  const colWidth: number = calendarBodyWidth / daysNum;

  const dayTextColumnWidth: any = {
    width: colWidth,
  };

  const renderNumericDays = () =>
    calendarDays[index].map((day: DateTime) => {
      const isDayToday: boolean = LuxonHelper.isToday(day);
      const isSelected: boolean =
        LuxonHelper.isSameDay(day, selectedDate) &&
        calendarView === 'day' &&
        !isDayToday;

      return (
        <div
          key={day.toString()}
          className={'header_calendar_days__col'}
          style={dayTextColumnWidth}
        >
          <div
            className={`header_calendar_days__text-circle-col${
              isDayToday ? '-today' : ''
            }${isSelected ? '-selected' : ''}${isDark ? '-dark' : ''}`}
          >
            <p
              className={`header_calendar_days__text-numeric${
                isDayToday || isSelected ? '-today' : ''
              }${isDark ? '-dark' : ''}`}
            >
              {day.day}
            </p>
          </div>
        </div>
      );
    });

  const numericDays: any = renderNumericDays();

  return (
    <div className={'header_calendar_days__wrapper'}>
      <div className={'header_calendar_days__container'}>{numericDays}</div>
    </div>
  );
};

interface HeaderDaysProps {
  width: number;
  isMonthView: boolean;
  index: number;
}
const HeaderDays = (props: HeaderDaysProps) => {
  const { width, isMonthView, index } = props;

  const calendarDays: any = useSelector((state: any) => state.calendarDays);

  const [store] = useContext(Context);
  const { isDark } = store;

  const daysNum: number = isMonthView ? 7 : calendarDays[index].length;
  const headerStyle = {
    paddingLeft: isMonthView ? 0 : CALENDAR_OFFSET_LEFT,
  };

  return (
    <div
      className={parseCssDark('header_calendar_days__text__wrapper', isDark)}
      style={headerStyle}
    >
      <div className={'header_calendar_days__text__container'}>
        <DaysText
          width={width}
          daysNum={daysNum}
          days={isMonthView ? daysText : calendarDays[index]}
        />
      </div>
      {!isMonthView ? (
        <div className={'header_calendar_days__text__container'}>
          <DaysNumeric index={index} daysNum={daysNum} />
        </div>
      ) : null}
    </div>
  );
};

interface IHeaderEventsProps {
  daysNum: number;
  calendarDays: any;
}
const HeaderEvents = (props: IHeaderEventsProps) => {
  const { daysNum, calendarDays } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const events: any = useSelector((state: any) => state.events);
  const calendarBodyWidth: number = useSelector(
    (state: any) => state.calendarBodyWidth
  );

  const renderEvents = (baseWidth: number, dataset: any) => {
    let offsetCount: any = []; //Store every event id of overlapping items
    let offsetCountFinal: any; //Sort events by id number
    const tableWidth: number = baseWidth / daysNum;

    if (dataset) {
      return dataset
        .filter(
          (item: any) =>
            item.allDay ||
            // @ts-ignore
            parseToDateTime(item.endAt, item.timezoneStart)
              .diff(parseToDateTime(item.startAt, item.timezoneStart), 'days')
              .toObject().days >= 1
        )
        .map((event: any) => {
          let width = 1; //Full width
          let offsetLeft = 0;

          // Compare events
          dataset.forEach((item2: any) => {
            if (
              event.id !== item2.id &&
              (item2.allDay ||
                // @ts-ignore
                parseToDateTime(item2.endAt, item2.timezoneStart)
                  .diff(
                    parseToDateTime(item2.startAt, item2.timezoneStart),
                    'days'
                  )
                  .toObject().days >= 1)
            ) {
              if (checkOverlappingEvents(event, item2)) {
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
          // @ts-ignore
          const calendarColor =
            calendarColors[event.color ? event.color : 'indigo'][
              isDark ? 'dark' : 'light'
            ];

          const eventWidth: any = tableWidth / width - 2;
          offsetCount = [];
          offsetCountFinal = '';

          return (
            <EventHeader
              key={event.id}
              eventWidth={eventWidth}
              offsetLeft={offsetLeft}
              calendarColor={calendarColor}
              event={event}
              isDark={isDark}
            />
          );
        });
    }
  };

  const column = calendarBodyWidth / props.daysNum;

  const headerStyle: any = {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    justifyContent: 'center',
    height: 40,
    paddingLeft: CALENDAR_OFFSET_LEFT,
  };
  const headerRow: any = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  };
  const todayDay: any = {
    alignSelf: 'center',
    width: column,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const daysNumbers = calendarDays.map((day: any, index: any) => {
    const formattedDayString: string = formatTimestampToDate(day);

    const dataForDay: any = events ? events[formattedDayString] : [];

    const headerEvents: any = renderEvents(calendarBodyWidth, dataForDay);

    return (
      <div key={day.toString()} style={todayDay}>
        <div
          style={{
            width: column,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {headerEvents}
        </div>
      </div>
    );
  });

  return (
    <div style={headerStyle}>
      <div style={headerRow}>{daysNumbers}</div>
    </div>
  );
};

interface CalendarHeaderProps {
  index: number;
  daysNum: number;
}
const CalendarHeader = (props: CalendarHeaderProps) => {
  const width: number = WidthHook();
  const { daysNum, index } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const calendarDays: CalendarDays = useSelector(
    (state: ReduxState) => state.calendarDays
  );
  const calendarView: CalendarView = useSelector(
    (state: ReduxState) => state.calendarView
  );
  const isDayView: boolean = calendarView === CALENDAR_DAY_VIEW;
  const isMonthView: boolean = calendarView === CALENDAR_MONTH_VIEW;

  return (
    <div
      className={`header_calendar__wrapper${!isMonthView ? '--tall' : ''}${
        isDayView ? '--day' : ''
      }${isMonthView ? '--small' : ''}${isDark ? '--dark' : ''}`}
    >
      <HeaderDays index={index} width={width} isMonthView={isMonthView} />
      {!isMonthView ? (
        <HeaderEvents calendarDays={calendarDays[index]} daysNum={daysNum} />
      ) : null}
    </div>
  );
};

export default CalendarHeader;
