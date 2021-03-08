import { cloneDeep } from '../../utils/common';
import { formatTimestampToDate } from 'bloben-utils';

const events = (state: any = {}, action: any) => {
  switch (action.type) {
    case 'SET_EVENTS':
      return action.payload;
    case 'ADD_EVENTS':
      return {
        ...state,
        ...action.payload,
      };
    case 'MERGE_EVENT':
      const dateKey: string = formatTimestampToDate(action.payload.startAt);

      const clonedState: any = cloneDeep(state);
      const hasDay: boolean = clonedState[dateKey] !== undefined;

      if (!hasDay) {
        clonedState[dateKey] = [action.payload];
      } else {
        clonedState[dateKey].push(action.payload);
      }

      return {
        ...{},
        ...clonedState,
      };
    default:
      return state;
  }
};

export default events;
