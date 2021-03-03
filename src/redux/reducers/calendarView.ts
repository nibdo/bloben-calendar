import { CALENDAR_WEEK_VIEW } from '../../utils/contants';
import { CalendarView } from '../../types/types';

const calendarView = (
  state: CalendarView = CALENDAR_WEEK_VIEW,
  action: any
) => {
  switch (action.type) {
    case 'SET_CALENDAR_VIEW':
      return action.payload;
    default:
      return state;
  }
};

export default calendarView;
