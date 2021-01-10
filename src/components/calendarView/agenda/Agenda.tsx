import React, { useContext, useEffect, useState } from 'react';
import './Agenda.scss';
import { format, getMonth, isBefore, isToday } from 'date-fns';
import {
  HEADER_HEIGHT_SMALL,
  NAVBAR_HEIGHT_BASE,
  parseEventColor,
  parseStringToDate,
} from '../calendar-common';
import { useDispatch, useSelector } from 'react-redux';
import EventStateEntity from '../../../data/entities/state/event.entity';
import { setEventsAreFetching } from '../../../redux/actions';
import _ from 'lodash';
import { useHistory } from 'react-router';
import { HeightHook } from '../../../bloben-common/utils/layout';
import { Context } from '../../../bloben-package/context/store';

interface IMonthTitleProps {
  isDark: boolean;
  title: string;
}
const MonthTitle = (props: IMonthTitleProps) => {
  const { isDark, title } = props;

  return (
    <div className={'agenda-item__wrapper-title'}>
      <div className={'header__title-button '}>
        <p className={`header__title${isDark ? '-dark' : ''}`}>{title}</p>
      </div>
    </div>
  );
};

interface IAgendaEventProps {
  isDark: boolean;
  item: any;
  isFirstForDay?: boolean;
  changeHeaderTitle: any;
  initScrollOffset: any;
  history: any;
  isDisabled?: boolean;
}
const AgendaEvent = (props: IAgendaEventProps) => {
  const {
    isDark,
    item,
    isFirstForDay,
    changeHeaderTitle,
    initScrollOffset,
    history,
    isDisabled,
  } = props;

  const { id, color, text, startAt, endAt } = item;

  const eventColor: string = parseEventColor(color, isDark);

  const itemStyle: any = {
    background: `${eventColor}33`,
  };

  const isDateToday: boolean = isFirstForDay ? isToday(startAt) : false;

  // Scroll to first event
  useEffect(() => {
    if (initScrollOffset && isFirstForDay) {
      changeHeaderTitle(format(startAt, 'MMMM'));
      // @ts-ignore

      const element: any = document.getElementById('agenda');

      if (element) {
        element.scrollTo({ top: initScrollOffset * 102 });
      }
    }
  }, []);

  const handleEventClick = (): void => {
    if (isDisabled) {
      return;
    }

    history.push(`/event/${id}`);
  };

  return (
    <div
      className={'agenda-item__wrapper'}
      id={format(startAt, 'MMMM')}
      onClick={handleEventClick}
    >
      <div
        style={{
          width: 60,
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
            <div className={'agenda__day-container-small'}>
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

interface IAgendaComponentProps {
  events: any;
  isDisabled?: boolean;
  isDark: boolean;
  changeHeaderTitle: any;
  initScrollOffset: any;
}
const AgendaComponent = (props: IAgendaComponentProps) => {
  const {
    events,
    isDark,
    isDisabled,
    initScrollOffset,
    changeHeaderTitle,
  } = props;

  const history: any = useHistory();

  return events.map((event: EventStateEntity, index: number) => (
    <AgendaEvent
      item={event}
      isFirstForDay={index === 0}
      history={history}
      isDisabled={isDisabled}
      isDark={isDark}
      changeHeaderTitle={changeHeaderTitle}
      initScrollOffset={initScrollOffset}
    />
  ));
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
            <MonthTitle title={format(dateObj, 'MMMM')} isDark={isDark} />
          ) : null}
          <AgendaComponent
            key={dateObj.toString()}
            events={dayEvents}
            isDark={isDark}
            changeHeaderTitle={changeHeaderTitle}
            initScrollOffset={isDateToday ? initScrollOffset : null}
            isDisabled={isDisabled}
          />{' '}
        </div>
      );
    }
  });
};

interface IAgendaViewProps {
  handleScroll: any;
  setListHeight: any;
  changeHeaderTitle: any;
}
const AgendaView = (props: IAgendaViewProps) => {
  const { handleScroll, setListHeight, changeHeaderTitle } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const events: any = useSelector((state: any) => state.events);

  const height: number = HeightHook();

  const daysWithEvents: any = renderAgendaEvents(
    events,
    isDark,
    changeHeaderTitle,
    setListHeight
  );

  const wrapperStyle: any = {
    height: height - NAVBAR_HEIGHT_BASE - HEADER_HEIGHT_SMALL,
  };

  return (
    <div
      className={'agenda__wrapper'}
      id={'agenda'}
      onScroll={handleScroll}
      style={wrapperStyle}
    >
      {daysWithEvents}
    </div>
  );
};

interface IAgendaProps {
  changeHeaderTitle: any;
  getNewCalendarDays: any;
}
const Agenda = (props: IAgendaProps) => {
  const eventsAreFetching: boolean = useSelector(
    (state: any) => state.eventsAreFetching
  );
  const dispatch: any = useDispatch();

  const [listHeight, setListHeight] = useState(0);
  const { changeHeaderTitle, getNewCalendarDays } = props;

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
        FETCH_NEW_DATA_THRESHOLD - agendaElement.clientHeight &&
      !eventsAreFetching
    ) {
      dispatch(setEventsAreFetching(true));
      getNewCalendarDays();
    }
  };

  return (
    <AgendaView
      handleScroll={handleScroll}
      changeHeaderTitle={changeHeaderTitle}
      setListHeight={setListHeight}
    />
  );
};

export default Agenda;
