import React from 'react';
import './EventDates.scss';
import { LuxonHelper } from 'bloben-utils';
import { parseToDateTime } from 'bloben-utils/dates/datetimeParser';

interface EventDatesProps {
  event: any;
  isSmall: boolean;
}

export const EventDates = (props: EventDatesProps) => {
  const { event, isSmall } = props;
  const { startAt, endAt, timezoneStart } = event;

  const isSameDay: boolean = LuxonHelper.isSameDay(startAt, endAt);

  const dateFromString: string = parseToDateTime(
    startAt,
    timezoneStart
  ).toFormat(`d LLL ${isSameDay ? 'yyyy' : ''}`);
  const dateToString: string = !isSameDay
    ? ` - ${parseToDateTime(endAt, timezoneStart).toFormat('d LLL yyyy')}`
    : '';
  const dates = `${dateFromString}${dateToString}`;

  const timeFrom: string = parseToDateTime(startAt, timezoneStart).toFormat(
    'hh:mm'
  );
  const timeTo: string = parseToDateTime(endAt, timezoneStart).toFormat(
    'hh:mm'
  );
  const time = `${timeFrom}${timeTo}`;

  return (
    <div
      className={isSmall ? 'search-item__container' : 'event-dates__container'}
    >
      <p className={isSmall ? 'search-item__text' : 'event-dates__text-date'}>
        {dates}
      </p>
      <p className={isSmall ? 'search-item__text' : 'event-dates__text-hour'}>
        {time}
      </p>
    </div>
  );
};

export default EventDates;
