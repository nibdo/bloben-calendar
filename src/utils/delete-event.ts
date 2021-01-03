import CalendarApi from '../api/calendar';
import { reduxStore } from '../layers/redux-layer';
import { addEvents, setEvents } from '../redux/actions';
import { cloneDeep } from './common';

export const deleteEvent = async (
    eventToDeleteId: any
) => {
    const store: any = reduxStore.getState();

    // Handle merging state
    // Clone state
    const stateClone: any = cloneDeep(store.events);

    // Loop over days
    for (const [day, value] of Object.entries(stateClone)) {
        const array: any = value;
        // Loop over specific day events from server
        const valueAfterFilter: any = array.filter((item: any) => {
            return item.id !== eventToDeleteId
        })
        if (array.length !== valueAfterFilter) {
            stateClone[day] = valueAfterFilter;
        }
    }


    reduxStore.dispatch(setEvents(stateClone));

    // TODO add to cache??
};
