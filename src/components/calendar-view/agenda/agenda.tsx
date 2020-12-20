import React, { useEffect, useState } from 'react';
import './agenda.scss';
import {
  format,
  getMonth,
  isBefore,
  isToday,
  parseISO,
} from 'date-fns';
import {
  calendarColors, HEADER_HEIGHT_BASE, HEADER_HEIGHT_SMALL, NAVBAR_HEIGHT_BASE, parseEventColor,
  parseStringToDate,
} from '../calendar-common';
import { useDispatch, useSelector } from 'react-redux';
import EventStateEntity from '../../../data/entities/state/event.entity';
import { setEventsAreFetching } from '../../../redux/actions';
import _ from 'lodash';
import { useCurrentHeight } from '../../../bloben-common/utils/layout';
import { useHistory } from 'react-router';

const MonthTitle = (props: any) => {
  const { isDark, title } = props;

  return (
    <div className={'agenda-item__wrapper-title'}>
      <div className={`header__title-button `}>
        <p className={`header__title${isDark ? '-dark' : ''}`}>{title}</p>
      </div>
    </div>
  );
};

const AgendaEvent = (props: any) => {
  const {
    isDark,
    item,
    isFirstForDay,
    changeHeaderTitle,
    initScrollOffset,
    history,
      isDisabled
  } = props;
  const { id, color, text, startAt, endAt, calendarId } = item;
  //TODO get hours from - to

  //TODO color parser
  const eventColor: string = parseEventColor(color, isDark);

  const itemStyle: any = {
    // borderLeft: `solid 10px ${eventColor}`,
    background: `${eventColor}33`,
  };

  const isDateToday: boolean = isFirstForDay ? isToday(startAt) : false;

  // Scroll to first event
  useEffect(() => {
    if (initScrollOffset && isFirstForDay) {
      changeHeaderTitle(format(startAt, 'MMMM'));
      // @ts-ignore

      const element: any = document
          .getElementById('agenda');

      if (element) {
        element.scrollTo({ top: initScrollOffset * 102 });
      }


    }
  }, []);

  const handleEventClick = (): void => {
    if (isDisabled) {
      return;
    }

    history.push(`/event/${id}`)
  }

  return (
    <div className={'agenda-item__wrapper'} id={format(startAt, 'MMMM')} onClick={handleEventClick}>
      <div
        style={{
          width: 60,
          // height: 60,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 8,
        }}
      >
        {isFirstForDay ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <div
              className={`agenda__day-container${isDateToday ? '-today' : ''}`}
            >
              <p className={`agenda__day-text${isDateToday ? '-today' : ''}`}>
                {format(startAt, 'd')}
              </p>
            </div>
            <div className={`agenda__day-container-small`}>
              <p>{format(startAt, 'iii')}</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className={'agenda-item__container'} style={itemStyle}>
        <p className={'agenda-item__title'}>{text}</p>
        <p className={'agenda-item__hours'}>
          {format(startAt, 'hh:mm')}- {format(endAt, 'hh:mm')}
        </p>
      </div>
    </div>
  );
};

const AgendaComponent = (props: any) => {
  const { events, isDisabled } = props;
  const history: any = useHistory();

  return events.map((event: EventStateEntity, index: number) => {
    return <AgendaEvent item={event} {...props} isFirstForDay={index === 0} history={history} isDisabled={isDisabled}/>;
  });
};

export const renderAgendaEvents = (
  data: any,
  isDark: boolean,
  changeHeaderTitle: any,
  setListHeight: any,
  isDisabled?: boolean
) => {
  // TODO handle multi day events

  let prevMonth: any;

  // Store offset for each event
  let initScrollOffset: number = 0;

  // Get real list height
  let itemsCount: number = 0;

  const objectData: any = Object.keys(data);

  return objectData.map((keyName: string, index: number) => {
    // const { id, startAt, endDate, scrollToSet } = item;
    const item: any = data[keyName];

    const dateObj: Date = parseStringToDate(keyName);
    const thisMonth: any = getMonth(dateObj);
    const isNewMonth: boolean = thisMonth !== prevMonth;
    const isDateToday: boolean = isToday(dateObj);
    const isBeforeToday: boolean = isBefore(dateObj, new Date());

    prevMonth = thisMonth;
    const dayEvents: EventStateEntity[] = item;
    if (dayEvents && dayEvents.length > 0) {
      // Calculate offset
      if (isNewMonth) {
        itemsCount += 1;
        initScrollOffset += 1;
      }
      if (!isDateToday && isBeforeToday) {
        initScrollOffset += dayEvents.length;
      }
      // TODO handle when no event for today

      // Store items count
      itemsCount = itemsCount + dayEvents.length;
      if (index + 1 === objectData.length) {
        setListHeight(itemsCount);
      }

      return (
        <div>
          {isNewMonth ? (
            <MonthTitle
              id={dateObj}
              title={format(dateObj, 'MMMM')}
              isDark={isDark}
            />
          ) : null}
          <AgendaComponent
            key={dateObj.toString()}
            day={dateObj}
            events={dayEvents}
            isDark={isDark}
            index={index}
            scrollId={isDateToday ? 'scroll-to' : null}
            changeHeaderTitle={changeHeaderTitle}
            isNewMonth={isNewMonth}
            initScrollOffset={isDateToday ? initScrollOffset : null}
            isDisabled={isDisabled}
          />{' '}
        </div>
      );
    }
  });
};

const AgendaView = (props: any) => {
  const {
    handleScroll,
    setListHeight,
    changeHeaderTitle
  } = props;
  const events: any = useSelector((state: any) => state.events);
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const height: number = useCurrentHeight();

  const daysWithEvents: any = renderAgendaEvents(
      events,
      isDark,
      changeHeaderTitle,
      setListHeight
  );

  const wrapperStyle: any = {
    height: height - NAVBAR_HEIGHT_BASE - HEADER_HEIGHT_SMALL
  }

  return (
    <div className={'agenda__wrapper'} id={'agenda'} onScroll={handleScroll} style={wrapperStyle}>
      {daysWithEvents}
    </div>
  );
};

const Agenda = (props: any) => {
  const eventsAreFetching: boolean = useSelector((state: any) => state.eventsAreFetching);
  const dispatch: any = useDispatch();

  const [listHeight, setListHeight] = useState(0);
  const {
    mappedCalendars,
    changeHeaderTitle,
    getNewCalendarDays,
  } = props;

  // Threshold trigger for fetching new data
  const FETCH_NEW_DATA_THRESHOLD: number = (listHeight - 6) * 102;

  // Debounce scroll function
  const handleScroll = _.debounce((e: any) => {
      handleScrollFunc(e);
    }, 50);

  // Handle onScroll event
  // Fetch new data on list end and update header title
  const handleScrollFunc = (e: any) => {
    const agendaElement: any = document.getElementById('agenda');
    const element = document.elementFromPoint(0, 56);

    // Check and change header title on month change flags
    if (element && element.id) {

      changeHeaderTitle(element.id);
    }
    // Fetch new events on end of list
    if (
      agendaElement.scrollTop >
      FETCH_NEW_DATA_THRESHOLD - agendaElement.clientHeight && !eventsAreFetching
    ) {
      dispatch(setEventsAreFetching(true));
      getNewCalendarDays();
    }
  };

  return  <AgendaView
      mappedCalendars={mappedCalendars}
      handleScroll={handleScroll}
      changeHeaderTitle={changeHeaderTitle}
      setListHeight={setListHeight}
    />
};

export default Agenda;
