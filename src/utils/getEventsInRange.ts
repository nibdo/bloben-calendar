import { DateTime } from 'luxon';

import { getDayTimeEnd, getDayTimeStart } from './common';
import SyncEvents from './sync/EventsSync';
import { setRangeFrom, setRangeTo } from '../redux/actions';
import { ReduxState } from '../types/types';
import { reduxStore } from 'bloben-module/layers/ReduxProvider';

/**
 * Get events in range
 */
export const getEventsInRange = async (): Promise<void> => {
  const currentDate: DateTime = DateTime.local();
  const rangeFromInit: string = getDayTimeStart(currentDate.minus({ days: 7 }));
  const rangeToInit: string = getDayTimeEnd(currentDate.plus({ days: 14 }));

  await SyncEvents.getAllInRange(rangeFromInit, rangeToInit);
};

export const requestEvents = async (): Promise<void> => {
  const store: ReduxState = reduxStore.getState();
  const { rangeTo } = store;

  const newRangeTo: string = DateTime.fromISO(rangeTo)
    .plus({ months: 2 })
    .toString();
  reduxStore.dispatch(setRangeFrom(rangeTo));
  reduxStore.dispatch(setRangeTo(newRangeTo));

  await SyncEvents.getAllInRange(rangeTo, newRangeTo);
};
