import React from 'react';
import './MonthView.scss';
import CalendarHeader from '../../calendarHeader/CalendarHeader';
import { getDate, isSameMonth, isToday } from 'date-fns';
import { ButtonBase } from '@material-ui/core';
import { HeightHook, WidthHook } from '../../../bloben-common/utils/layout';
import { useSelector } from 'react-redux';
import {
  CALENDAR_DRAWER_DESKTOP_WIDTH,
  checkIfSwipingForward,
  formatTimestampToDate,
  parseEventColor,
} from '../calendar-common';
import { useHistory } from 'react-router';
import Slider from 'react-slick';
import { parseCssDark } from '../../../bloben-common/utils/common';

interface IEventProps {
  isDark: boolean;
  event: any;
  eventWidth: number;
}
const Event = (props: IEventProps) => {
  const { isDark, event, eventWidth } = props;
  const eventColor: string = parseEventColor(event.color, isDark);
  const history: any = useHistory();

  const style: any = {
    height: 14,
    width: eventWidth,
    borderWidth: 0,
    borderColor: eventColor,
    borderRadius: 4,
    zIndex: 2,
    marginLeft: 1,
    marginRight: 1,
    backgroundColor: /*dragging ? 'blue' : */ eventColor,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    paddingLeft: 4,
    paddingRight: 4,
    /*overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",*/ minWidth: 0,
    marginTop: 1,
  };

  const eventTextStyle: any = {
    display: '-webkit-box',
    WebkitLineClamp: '1',
    WebkitBoxOrient: 'vertical',
    fontSize: 11,
    margin: 0,
    padding: 0,
    opacity: 1,
    overflow: 'hidden',
  };
  const handleEventSelect = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/calendar/event/${event.id}`);
    // dispatch(selectEvent(props.event))
  };

  return (
    <ButtonBase
      color='primary' //Dragging func {...panResponder.panHandlers}
      style={style}
      onClick={handleEventSelect}
    >
      <p
        className={`event__text${isDark ? '--dark' : ''}`}
        style={eventTextStyle}
      >
        {event.text}{' '}
      </p>
    </ButtonBase>
  );
};

interface IOneDayProps {
  height: number;
  data: any;
  borderClass: string;
  day: any,
}
const OneDay = (props: IOneDayProps) => {
  const {height, data, borderClass, day} = props;
  const selectedDate: Date = useSelector((state: any) => state.selectedDate);
  const isDark: boolean = useSelector((state: any) => state.isDark);

  const renderEvents = (dataset: any) => {
    const tableWidth: any = '90%';
    const tableHeight: number = height / 6 - 25; // height of one day
    const maxEvents: any = Number(String(tableHeight / 15));

    const eventStyle: any = {
      height: 14,
      borderWidth: 1,
      borderRadius: 4,
      zIndex: 2,
      marginLeft: 1,
      marginRight: 1,
      marginBottom: 1,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      paddingLeft: 4,
      paddingRight: 4,
      /*overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",*/ minWidth: 0,
      marginTop: 1,
    };

    const eventTextStyle: any = {
      display: '-webkit-box',
      WebkitLineClamp: '1',
      WebkitBoxOrient: 'vertical',
      fontSize: 10,
      fontFamily: 'Open Sans',
      margin: 0,
      padding: 0,
      opacity: 1,
      overflow: 'hidden',
    };

    const eventsCount: any = [];

    if (dataset) {
      return dataset.map((event: any, index: number) => {
        //event.left
        // BUG/TODO break event if continues next day
        // Current status: events is displayed in wrong place
        eventsCount.push('one');
        if (eventsCount.length < maxEvents || maxEvents === dataset.length) {
          return (
            <Event
              key={event.id}
              eventWidth={tableWidth}
              event={event}
              isDark={isDark}
            />
          );
        } else if (
          eventsCount.length > maxEvents &&
          index + 1 === dataset.length
        ) {
          return (
            <div style={eventStyle}>
              <p style={eventTextStyle}>
                ...{eventsCount.length + 1 - maxEvents} more
              </p>
            </div>
          );
        }
      });
    }
  };

  const renderDate = (date: Date) => {
    const dateBoxToday: any = {
      height: 20,
      width: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    };
    const dateBox: any = {
      height: 20,
      width: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    };

    if (isToday(date)) {
      return (
        <div
          style={dateBoxToday}
          className={parseCssDark('month__color_circle', isDark)}
        >
          <p className={parseCssDark('month__day-today', isDark)}>
            {getDate(date)}
          </p>
        </div>
      );
    } else if (isSameMonth(date, selectedDate)) {
      return (
        <div style={dateBox}>
          <p className={parseCssDark('month__day', isDark)}>{getDate(date)}</p>
        </div>
      );
    } else {
      return (
        <div style={dateBox}>
          <p className={parseCssDark('month__day-past', isDark)}>
            {getDate(date)}
          </p>
        </div>
      );
    }
  };

  const dataForDay: any = data;
  const colHeader: any = {
    height: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const colEvents: any = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const events: any = dataForDay ? renderEvents(dataForDay) : null;

  return (
    <div className={borderClass}>
      <div style={colHeader}>{renderDate(day)}</div>
      <div style={colEvents}>{events}</div>
    </div>
  );
};

const MonthViewContainer = (props: any) => {
  const { selectedDate, daysNum, getNewCalendarDays } = props;
  const width: any = WidthHook();
  const height: number = HeightHook();
  const isMobile: boolean = useSelector((state: any) => state.isMobile);
  const calendarDaysCurrentIndex: number = useSelector(
    (state: any) => state.calendarDaysCurrentIndex
  );
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const calendarDays: any = useSelector((state: any) => state.calendarDays);
  const events: any = useSelector((state: any) => state.events);
  // Calculate height for days table
  const tableHeight: number = height - 56 - 30 - 50;

  const daysWrapper: any = {
    width: isMobile ? width : width - CALENDAR_DRAWER_DESKTOP_WIDTH,
    height: tableHeight,
  };
  const renderOneDay = (data: any) =>
    data.map((day: any, index: any) => {
      let borderClass;
      if (index < 7) {
        if (index === 6) {
          borderClass = 'month_view__border--bottom';
        } else {
          borderClass = 'month_view__border--bottom--right';
        }
      } else if (index < 35) {
        if (index === 13 || index === 20 || index === 27 || index === 34) {
          borderClass = 'month_view__border--bottom';
        } else {
          borderClass = 'month_view__border--bottom--right';
        }
      } else {
        if (index === 41) {
          borderClass = 'month_view__border';
        } else {
          borderClass = 'month_view__border--right';
        }
      }
      const formattedDayString: string = formatTimestampToDate(day);

      return (
        <OneDay
          key={day}
          height={tableHeight}
          borderClass={isDark ? `${borderClass}--dark` : borderClass}
          day={day}
          data={events ? events[formattedDayString] : []}
        />
      );
    });
  const days0: any = renderOneDay(calendarDays[0]);
  const days1: any = renderOneDay(
    calendarDays[isMobile ? 1 : calendarDaysCurrentIndex]
  );
  const days2: any = renderOneDay(calendarDays[2]);

  const sliderSettings: any = {
    dots: false,
    infinite: true,
    speed: 250,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange(currentSlide: number, nextSlide: number) {
      const isGoingForward: boolean = checkIfSwipingForward(
        currentSlide,
        nextSlide
      );
      getNewCalendarDays(isGoingForward, nextSlide);
    },
    initialSlide: 1,
  };

  return isMobile ? (
    <Slider {...sliderSettings}>
      <div className={'full-screen'} id={'calendar'}>
        <CalendarHeader index={0} daysNum={daysNum}/>
        <div className={'month_view__container'} style={daysWrapper}>
          {days0}
        </div>
      </div>
      <div className={'full-screen'} id={'calendar'}>
        <CalendarHeader index={1} daysNum={daysNum} />
        <div className={'month_view__container'} style={daysWrapper}>
          {days1}
        </div>
      </div>
      <div className={'full-screen'} id={'calendar'}>
        <CalendarHeader index={2} daysNum={daysNum} />
        <div className={'month_view__container'} style={daysWrapper}>
          {days2}
        </div>
      </div>
    </Slider>
  ) : (
    <div className={'full-screen'} id={'calendar'}>
      <CalendarHeader index={1} daysNum={daysNum} />
      <div className={'month_view__container'} style={daysWrapper}>
        {days1}
      </div>
    </div>
  );
};

const MonthView = (props: any) =>
  <MonthViewContainer {...props} />;

export default MonthView;
