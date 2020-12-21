import React from 'react';
import './calendar-header.scss';
import {
  areIntervalsOverlapping,
  differenceInMinutes, format, formatISO,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { useCurrentWidth } from 'bloben-common/utils/layout';
import {
  CALENDAR_DRAWER_DESKTOP_WIDTH,
  CALENDAR_OFFSET_LEFT, calendarColors,
  daysText, formatTimestampToDate,
  getWeekDays,
} from '../calendar-view/calendar-common';
import { useSelector } from 'react-redux';
import { parseCssDark } from '../../bloben-common/utils/common';
import OneDay from '../one-day/one-day';
import { useHistory } from 'react-router-dom';

const EventHeader = (props: any) => {
  const history: any = useHistory();

  const style: any = {
    width: props.eventWidth,
    borderColor: props.calendarColor,
    borderRadius: 4,
    background: /*dragging ? 'blue' : */ props.calendarColor,
    left: props.offsetLeft,
  };

  const handleEventSelect = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/event/${props.event.id}`)
  }

  return (
    <div
      className={'event_header__container'}
      style={style}
      onClick={handleEventSelect}
    >
      <p className={`event_header__text${props.isDark ? '--dark' : ''}`}>
        {props.event.text}{' '}
      </p>
    </div>
  );
};

/**
 * Render text representation of days
 *
 * @param props
 * @constructor
 */
const DaysText = (props: any) => {
  const { daysNum, days, width } = props;
  const calendarView: string = useSelector((state: any) => state.calendarView);
  const calendarBodyWidth: number = useSelector((state: any) => state.calendarBodyWidth);
  const isMobile: boolean = useSelector((state: any) => state.isMobile);

  const isMonthView: boolean = calendarView === 'month';

  const colWidth: number = isMonthView ? (isMobile ? width : width - CALENDAR_DRAWER_DESKTOP_WIDTH) / daysNum : (calendarBodyWidth) / daysNum ;

  const renderDaysText = () => {
    const dayTextColumnWidth: any = {
      width:  colWidth ,
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

    return days.map((day: Date) => (
          <div
              key={day.toString()}
              className={'header_calendar_days__col'}
              style={dayTextColumnWidth}
          >
            <p className={'header_calendar_days__text'}>{format(day, 'EEE')}</p>
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

/**
 * Get numeric representation of days
 *
 * @param props
 * @constructor
 */
const DaysNumeric = (props: any) => {
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const selectedDate: Date = useSelector((state: any) => state.selectedDate);
  const calendarView: string = useSelector((state: any) => state.calendarView);

  const calendarBodyWidth: number = useSelector((state: any) => state.calendarBodyWidth);
  const {
    daysNum,
    index
  } = props;

  const colWidth: number = (calendarBodyWidth) / daysNum;

  const dayTextColumnWidth: any = {
    width: colWidth,
  };

  const renderNumericDays = () =>
    calendarDays[index].map((day: Date) => {
      const isDayToday: boolean = isToday(day);
      const isSelected: boolean =
        isSameDay(day, selectedDate) &&
        calendarView === 'day' &&
        !isDayToday;

      return (
        <div
          key={formatISO(day)}
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
              {getDate(day)}
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

const HeaderDays = (props: any) => {
  const {
    isWeek,
    width,
    selectedDate,
    isMonthView,
    index
  } = props;
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const calendarView: any = useSelector((state: any) => state.calendarView);
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const isMobile: boolean = useSelector((state: any) => state.isMobile);

  const daysNum: number = isMonthView ? 7 : calendarDays[index].length;
  const headerStyle = {
    paddingLeft: isMonthView ? 0 : CALENDAR_OFFSET_LEFT,
  };

  const textStyle = {
    width: isMobile ? width : width - CALENDAR_DRAWER_DESKTOP_WIDTH,
  }

  return (
    <div className={parseCssDark('header_calendar_days__text__wrapper', isDark)} style={headerStyle}>
      <div className={'header_calendar_days__text__container'} >
        <DaysText
            index={index}
          width={width}
          daysNum={daysNum}
          isWeek={isWeek}
          days={isMonthView ? daysText : calendarDays[index]}
        />
      </div>
      {!isMonthView ? (
        <div className={'header_calendar_days__text__container'}>
          <DaysNumeric
              index={index}
              width={width}
            daysNum={daysNum}
            isWeek={isWeek}
            daysText={daysText}
            calendarDays={calendarDays[index]}
            selectedDate={selectedDate}
            calendarView={calendarView}
          />
        </div>
      ) : null}
    </div>
  );
};

const HeaderEvents = (props: any) => {
  const events: any   = useSelector((state: any) => state.events);

  const renderEvents = (dataset: any) => {
    let offsetCount: any = []; //Store every event id of overlapping items
    let offsetCountFinal: any; //Sort events by id number
    const offsetCountHeader: any = []; //Store every event id of overlapping items
    let offsetCountFinalHeader: any; //Sort events by id number
    const tableWidth: any =
        (props.width - CALENDAR_OFFSET_LEFT) / props.daysNum;

    if (dataset) {
      return dataset.filter((item: any) => item.allDay).map((event: any) => {

        let width = 1; //Full width
        let offsetLeft = 0;
        dataset.map((item2: any) => {
          if (
              event.id !== item2.id &&
              offsetCount.includes(item2.id) === false &&
              item2.allDay
          ) {
            width = width + 1; //add width for every overlapping item
            offsetCount.push(item2.id);
          }
        })

        if (offsetCount.length > 0) {
            offsetCountFinal = offsetCount.sort((a: any, b: any) => {
              return a - b; //sort items for proper calculations of offset by id
            });
          }

        if (offsetCountFinal) {
            offsetLeft =
                (tableWidth / offsetCountFinal.length) *
                offsetCountFinal.indexOf(event.id); //count offset
          }
        // @ts-ignore
        const calendarColor = calendarColors[event.color ? event.color : 'indigo'][props.isDark ? 'dark' : 'light'];

        const offsetTop: any = differenceInMinutes(
              parseISO(event.startDate),
              new Date(
                  getYear(parseISO(event.startDate)),
                  getMonth(parseISO(event.startDate)),
                  getDate(parseISO(event.startDate)),
                  0,
                  0,
                  0
              )
          );
        const eventHeight: any = 25;
        const eventWidth: any = tableWidth / width - 2; ///event.width.toString() + "%"
          //event.left
          // BUG/TODO break event if continues next day
          // Current status: events is displayed in wrong place
        offsetCount = [];
        offsetCountFinal = '';
        const eventElevation: any = 0;

        return (
              <EventHeader
                  key={event.id}
                  eventHeight={eventHeight}
                  offsetTop={offsetTop}
                  eventWidth={eventWidth}
                  offsetLeft={offsetLeft}
                  calendarColor={calendarColor}
                  eventElevation={eventElevation}
                  event={event}
                  editEvent={props.editEvent}
                  cryptoPassword={props.cryptoPassword}
                  selectEvent={props.selectEvent}
                  colors={props.colors}
              />
          );
      })
    }
  }

  const column = (props.width - CALENDAR_OFFSET_LEFT) / props.daysNum;

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

  const daysNumbers = props.calendarDays.map((day: any, index: any) => {
    const formattedDayString: string = formatTimestampToDate(day);

    const dataForDay: any = events ? events[formattedDayString] : [];

    const headerEvents: any = renderEvents(dataForDay);

    return (
      <div key={day} style={todayDay}>
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

const CalendarHeader = (props: any) => {
  const width: number = useCurrentWidth();
  const {
    hasHeaderEvents,
    selectEvent,
    data,
    hours,
    daysNum,
    selectedDate,
    index
  } = props;

  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const calendarView: any = useSelector((state: any) => state.calendarView);
  const isDark: any = useSelector((state: any) => state.isDark);
  const isWeek: boolean = calendarView === 'week' || calendarView === '3days';
  const isDayView: boolean = calendarView === 'day';
  const isMonthView: boolean = calendarView === 'month';
  const headerDays: any =
      isMonthView ? daysText : calendarDays[index];

  return (
    <div
      className={`header_calendar__wrapper${hasHeaderEvents ? '--tall' : ''}${
        isDayView ? '--day' : ''
      }${isMonthView ? '--small' : ''}${isDark ? '--dark' : ''} calendar-animation`}
    >
      <HeaderDays
          index={index}
        hours={hours}
        width={width}
        daysNum={headerDays.length}
        isWeek={isWeek}
        selectedDate={selectedDate}
        isMonthView={isMonthView}
      />
      {!isMonthView ? (
        <HeaderEvents
          calendarDays={calendarDays[index]}
          hours={hours}
          data={data}
          width={width}
          selectEvent={selectEvent}
          daysNum={daysNum}
        />
      ) : null}
    </div>
  );
};

export default CalendarHeader;
