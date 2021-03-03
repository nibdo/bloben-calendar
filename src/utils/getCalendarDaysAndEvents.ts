import {
  calculateCalendarDays,
  getNextCalendarDaysIndex,
} from './calculateCalendarDays';
import { CalendarDays, ReduxState } from '../types/types';
import {
  setCalendarDays,
  setCalendarDaysCurrentIndex,
  setRangeFrom,
  setRangeTo,
  setSelectedDate,
} from '../redux/actions';
import { chooseSelectedDateIndex } from '../components/calendarView/calendar-common';
import {
  getArrayEnd,
  getArrayStart,
  getDayTimeEnd,
  getDayTimeStart,
} from './common';
import SyncEvents from './sync/EventsSync';
import { reduxStore } from '../bloben-package/layers/ReduxProvider';
import { getEventsInRange } from './getEventsInRange';

/**
 * Calculate new calendar days and get events
 * @param isGoingForward
 * @param index
 */
export const getNewCalendarDays = async (
  isGoingForward?: boolean,
  index?: number
): Promise<void> => {
  const store: ReduxState = reduxStore.getState();
  const { calendarDaysCurrentIndex, calendarDays, calendarView } = store;

  if (isGoingForward === undefined) {
    await getEventsInRange();

    return;
  }

  const nextIndex: number = index
    ? index
    : getNextCalendarDaysIndex(isGoingForward, calendarDaysCurrentIndex);

  const newCalendarDays: CalendarDays = calculateCalendarDays(
    nextIndex,
    isGoingForward,
    calendarDays,
    calendarView
  );

  reduxStore.dispatch(setCalendarDays(newCalendarDays));
  reduxStore.dispatch(setCalendarDaysCurrentIndex(nextIndex));
  reduxStore.dispatch(
    setSelectedDate(
      newCalendarDays[nextIndex][chooseSelectedDateIndex(calendarView)]
    )
  );

  // Set range for fetch new events
  const rangeFromFetch: string = getDayTimeStart(
    getArrayStart(newCalendarDays[nextIndex])
  );
  const rangeToFetch: string = getDayTimeEnd(
    getArrayEnd(newCalendarDays[nextIndex])
  );

  // Store new edge value of range
  if (isGoingForward) {
    reduxStore.dispatch(setRangeTo(rangeToFetch));
  } else {
    reduxStore.dispatch(setRangeFrom(rangeFromFetch));
  }

  await SyncEvents.getAllInRange(rangeFromFetch, rangeToFetch);
};
