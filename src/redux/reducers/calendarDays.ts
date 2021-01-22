import { DateTime } from 'luxon';

const initState: any = [[], [], []]
const calendarDays = (state: DateTime | string [][] = initState, action: any) => {
    switch (action.type) {
        case 'SET_CALENDAR_DAYS':
            return action.payload;
        default:
            return state;
    }
}

export default calendarDays;
