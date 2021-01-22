import { DateTime } from 'luxon';

const eventsLastSynced = (state: any  = null, action: any) => {
    switch (action.type) {
        case 'SET_EVENTS_LAST_SYNC':
            return action.payload;
        default:
            return state;
    }
}

export default eventsLastSynced;
