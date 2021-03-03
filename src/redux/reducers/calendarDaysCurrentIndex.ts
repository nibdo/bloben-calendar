const DEFAULT_CALENDAR_DAYS_CURRENT_INDEX = 1;

const calendarDaysCurrentIndex = (
  state: number = DEFAULT_CALENDAR_DAYS_CURRENT_INDEX,
  action: any
) => {
  switch (action.type) {
    case 'SET_CALENDAR_DAYS_CURRENT_INDEX':
      return action.payload;
    case 'RESET_CALENDAR_DAYS_CURRENT_INDEX':
      return DEFAULT_CALENDAR_DAYS_CURRENT_INDEX;
    default:
      return state;
  }
};

export default calendarDaysCurrentIndex;
