import React, { useContext, useEffect, useReducer } from 'react';
import { useHistory, useParams } from 'react-router';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../CalendarEdit.utils';
import { addAlarm, findInArrayById, removeAlarm } from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { addCalendar, updateCalendar } from '../../../redux/actions';
import CalendarContent from '../calendarContent/CalendarContent';
import { getLocalTimezone } from '../../../bloben-package/utils/common';
import CalendarApi from '../../../api/calendar';
import {
  CalendarEncrypted,
  createCalendarEncrypted,
} from '../../../bloben-utils/models/CalendarEncrypted';
import { User } from '../../../bloben-utils/models/User';
import { ReduxState } from '../../../types/types';
import {
  Calendar,
  createCalendar,
} from '../../../bloben-utils/models/Calendar';
import { Context } from '../../../bloben-package/context/store';
import { logger } from '../../../bloben-common/utils/common';
import SyncCalendars from '../../../utils/sync/CalendarSync';

interface NewCalendarProps {
  isNewCalendar: boolean;
}

const EditCalendar = (props: NewCalendarProps) => {
  const { isNewCalendar } = props;

  const [store, dispatchContext] = useContext(Context);

  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const [calendarState, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { alarms, timezone } = calendarState;

  const history = useHistory();
  const params: any = useParams();
  const { id } = params;

  const dispatch: any = useDispatch();
  const user: User = useSelector((state: ReduxState): User => state.user);
  const calendars: Calendar[] = useSelector(
    (state: ReduxState): Calendar[] => state.calendars
  );
  const defaultCalendar: string = useSelector(
    (state: any) => state.defaultCalendar
  );

  const setLocalState = (stateName: string, data: any): void => {
    const payload: any = { stateName, type: 'simple', data };
    // @ts-ignore
    dispatchState({ calendarState, payload });
  };

  // Init props of selected calendar
  const initEditCalendar = async () => {
    // Find calendar
    const thisCalendar: Calendar = await findInArrayById(calendars, id);

    if (!thisCalendar) {
      // TODO error msg
    }

    // Set data
    for (const [key, value] of Object.entries(thisCalendar)) {
      if (key === 'alarms' && !value) {
        setLocalState(key, []);
      } else if (key === 'timezone' && !value) {
        setLocalState(key, getLocalTimezone());
      } else {
        setLocalState(key, value);
      }
    }
  };

  /**
   * Init new view on id change
   */
  useEffect(() => {
    initEditCalendar();
  }, [id]);

  const handleChange = (event: any) => {
    const target = event.target;
    setLocalState(target.name, event.target.value);
  };

  const addAlarmCalendar = (item: any) => {
    addAlarm(item, setLocalState, alarms);
  };

  const removeAlarmCalendar = (item: any) => {
    removeAlarm(item, setLocalState, alarms);
  };

  useEffect(() => {
    setLocalState('timezone', getLocalTimezone());
  }, []);

  const deleteCalendar = async (): Promise<void> => {
    if (params.id === defaultCalendar || !defaultCalendar) {
      logger("Error: Can't delete default calendar");

      return;
    }

    await CalendarApi.deleteCalendar({ id: params.id });

    SyncCalendars.deleteCalendar(params.id);

    history.goBack();
  };

  const saveCalendar = async (): Promise<void> => {
    try {
      const calendar: Calendar = createCalendar(calendarState);

      const encryptedCalendar: CalendarEncrypted = await createCalendarEncrypted(
        user.publicKey,
        calendar
      );

      if (isNewCalendar) {
        await CalendarApi.createCalendar(encryptedCalendar);

        // Save to redux store
        dispatch(addCalendar(calendar));
      } else {
        dispatch(updateCalendar(calendar));

        await CalendarApi.updateCalendar(encryptedCalendar);
      }

      history.goBack();
    } catch (e) {
      setContext('showSnackbar', {
        text: 'Error',
      });
    }
  };

  return (
    <CalendarContent
      calendarState={calendarState}
      handleChange={handleChange}
      saveCalendar={saveCalendar}
      addAlarm={addAlarmCalendar}
      removeAlarm={removeAlarmCalendar}
      deleteCalendar={!isNewCalendar ? deleteCalendar : undefined}
      setLocalState={setLocalState}
    />
  );
};

export default EditCalendar;
