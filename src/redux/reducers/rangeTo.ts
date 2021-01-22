import { addWeeks, subWeeks } from 'date-fns';

const rangeToReducer = (state: any = null, action: any) => {
    switch (action.type) {
        case 'ADD_WEEK':
            return addWeeks(state, 1)
        case 'SUB_WEEK':
            return subWeeks(state, 1)
        case 'SET_RANGE_TO':
            return action.payload;
        default:
            return state;
    }
}

export default rangeToReducer;
