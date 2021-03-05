import LuxonHelper from '../../../bloben-utils/utils/LuxonHelper';
import { parseToDateTime } from '../../../bloben-package/utils/datetimeParser';
import React from 'react';
import './EventDates.scss'

interface IEventDatesProps {
    event: any;
    isSmall: boolean;
}



export const EventDates = (props: IEventDatesProps) => {
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
  const dates: string = `${dateFromString}${dateToString}`;

  const timeFrom: string = parseToDateTime(startAt, timezoneStart).toFormat('hh:mm');
  const timeTo: string = parseToDateTime(endAt, timezoneStart).toFormat('hh:mm');
  const time: string = `${timeFrom}${timeTo}`

  return (
    <div className={isSmall ? 'search-item__container' : 'event-dates__container'}>
      <p className={isSmall ? 'search-item__text' : 'event-dates__text-date'}>{dates}</p>
      <p className={isSmall ? 'search-item__text' : 'event-dates__text-hour'}>
        {time}
      </p>
    </div>
  );
};

export default EventDates;
