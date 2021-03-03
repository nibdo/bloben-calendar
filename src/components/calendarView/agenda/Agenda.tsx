import React, { useContext, useEffect, useState } from 'react';
import { Dispatch } from 'redux';
import { useHistory } from 'react-router';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime } from 'luxon';

import './Agenda.scss';
import {
  HEADER_HEIGHT_SMALL,
  NAVBAR_HEIGHT_BASE,
  parseEventColor,
} from '../calendar-common';
import EventStateEntity from '../../../bloben-utils/models/event.entity';
import { setEventsAreFetching } from '../../../redux/actions';
import { HeightHook } from '../../../bloben-common/utils/layout';
import { Context } from '../../../bloben-package/context/store';
import { parseCssDark } from '../../../bloben-common/utils/common';
import LuxonHelper from '../../../bloben-utils/utils/LuxonHelper';
import { ReduxState } from '../../../types/types';
import { getNewCalendarDays } from '../../../utils/getCalendarDaysAndEvents';

interface MonthTitleProps {
  isDark: boolean;
  title: string;
}
const MonthTitle = (props: MonthTitleProps) => {
  const { isDark, title } = props;

  return (
    <div className={'agenda-item__wrapper-title'}>
      <div className={'header__title-button '}>
        <p className={parseCssDark('header__title', isDark)}>{title}</p>
      </div>
    </div>
  );
};

interface AgendaEventProps {
  isDark: boolean;
  item: any;
  isFirstForDay?: boolean;
  changeHeaderTitle: any;
  initScrollOffset: any;
  history?: any;
  isDisabled?: boolean;
}
export const AgendaEvent = (props: AgendaEventProps) => {
  const {
    isDark,
    item,
    isFirstForDay,
    changeHeaderTitle,
    initScrollOffset,
    history,
    isDisabled,
  } = props;

  const { id, color, summary, startAt, endAt } = item;

  const eventColor: string = parseEventColor(color, isDark);

  const itemStyle: any = {
    background: `${eventColor}`,
  };

  const isDateToday: boolean = isFirstForDay
    ? LuxonHelper.isToday(DateTime.fromISO(startAt))
    : false;

  // Scroll to first event
  useEffect(() => {
    if (initScrollOffset && isFirstForDay) {
      changeHeaderTitle(DateTime.fromISO(startAt).toFormat('MMMM'));
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
      id={DateTime.fromISO(startAt).toFormat('MMMM')}
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
              <p
                className={parseCssDark(
                  `agenda__day-text${isDateToday ? '-today' : ''}`,
                  isDark
                )}
              >
                {DateTime.fromISO(startAt).toFormat('d')}
              </p>
            </div>
            <div className={'agenda__day-container-small'}>
              <p className={parseCssDark('agenda__day-text-small', isDark)}>
                {DateTime.fromISO(startAt).toFormat('iii')}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className={'agenda-item__container'} style={itemStyle}>
        <p className={parseCssDark('agenda-item__title', isDark)}>{summary}</p>
        <p className={'agenda-item__hours'}>
          {DateTime.fromISO(startAt).toFormat('hh:mm')} -{' '}
          {DateTime.fromISO(endAt).toFormat('hh:mm')}
        </p>
      </div>
    </div>
  );
};

interface AgendaComponentProps {
  events: any;
  isDisabled?: boolean;
  isDark: boolean;
  changeHeaderTitle: any;
  initScrollOffset: any;
}
const AgendaComponent = (props: AgendaComponentProps) => {
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

/**
 * Format string date to number in reverse order for comparing dates
 * @param dateString
 */
const parseDateKeysForSort = (dateString: string): number => {
  const dateArray: string[] = dateString.split('-');

  const year: string = dateArray[2];
  const month: string = dateArray[1];
  const day: string = dateArray[0];

  const stringResult = `${year}${month}${day}`;

  return Number(stringResult);
};

export const renderAgendaEvents = (
  data: any,
  isDark: boolean,
  changeHeaderTitle: any,
  setListHeight: any,
  isDisabled?: boolean
) => {
  // TODO handle multi day events

  let prevMonth: DateTime | null = null;

  let hasEventsForToday = false;
  let scrollOffsetFinished = false;

  // Store offset for each event
  let initScrollOffset = 0;

  // Get real list height
  let itemsCount = 0;

  const objectData: any = Object.keys(data);

  const objectDataSorted: any = objectData
    .sort((a: any, b: any) => parseDateKeysForSort(a) - parseDateKeysForSort(b))
    .reduce((value: any, key: string) => {
      value[key] = data[key];

      return value;
    }, {});

  return Object.keys(objectDataSorted).map((keyName: string, index: number) => {
    // const { id, startAt, endDate, scrollToSet } = item;
    const item: any = data[keyName];

    const dateObj: DateTime = DateTime.fromFormat(keyName, 'dd-mm-yyyy');
    const thisMonth: any = dateObj.month;

    const isNewMonth: boolean = thisMonth !== prevMonth;
    const isDateToday: boolean = LuxonHelper.isToday(dateObj);
    const isAfterToday: boolean =
      DateTime.local().startOf('day') < dateObj.startOf('day');

    if (!scrollOffsetFinished && !hasEventsForToday && isAfterToday) {
      scrollOffsetFinished = true;
    }

    prevMonth = thisMonth;
    const dayEvents: EventStateEntity[] = item;
    if (dayEvents && dayEvents.length > 0) {
      // Calculate offset
      if (isNewMonth) {
        itemsCount += 1;
        initScrollOffset += 1;
      }

      // Add offset only till today date
      if (!isDateToday && !hasEventsForToday) {
        initScrollOffset += dayEvents.length;
      }
      if (isDateToday) {
        hasEventsForToday = true;
      }
      // Set offset to first item after today
      if (!hasEventsForToday && isAfterToday) {
        initScrollOffset += dayEvents.length;

        // Prevent other
        hasEventsForToday = true;

        return (
          <div>
            {isNewMonth ? (
              <MonthTitle title={dateObj.toFormat('MMMM')} isDark={isDark} />
            ) : null}
            <AgendaComponent
              key={dateObj.toString()}
              events={dayEvents}
              isDark={isDark}
              changeHeaderTitle={changeHeaderTitle}
              initScrollOffset={initScrollOffset}
              isDisabled={isDisabled}
            />{' '}
          </div>
        );
      }

      // Store items count
      itemsCount = itemsCount + dayEvents.length;
      if (index + 1 === objectData.length) {
        setListHeight(itemsCount);
      }

      return (
        <div>
          {isNewMonth ? (
            <MonthTitle title={dateObj.toFormat('MMMM')} isDark={isDark} />
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

interface AgendaViewProps {
  handleScroll: any;
  setListHeight: any;
  changeHeaderTitle: any;
}
const AgendaView = (props: AgendaViewProps) => {
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

interface AgendaProps {
  changeHeaderTitle: any;
}
const Agenda = (props: AgendaProps) => {
  const eventsAreFetching: boolean = useSelector(
    (state: ReduxState) => state.eventsAreFetching
  );
  const dispatch: Dispatch = useDispatch();

  const [listHeight, setListHeight] = useState(0);
  const { changeHeaderTitle } = props;

  // Threshold trigger for fetching new data
  const FETCH_NEW_DATA_THRESHOLD: number = (listHeight - 6) * 102;

  // Debounce scroll function
  const handleScroll = _.debounce((e: any) => {
    handleScrollFunc(e);
  }, 50);

  // Handle onScroll event
  // Fetch new data on list end and update header title
  const handleScrollFunc = async (e: any) => {
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
      await getNewCalendarDays();
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
