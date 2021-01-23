import React, { useEffect, useReducer } from 'react';
import { useHistory } from 'react-router';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../CalendarEdit.utils';
import CalendarStateEntity, {
  CalendarBodyToSend,
} from '../../../data/entities/state/calendar.entity';
import { addNotification, removeNotification } from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { stompClient } from '../../../layers/AuthenticatedLayer';
import { addCalendar } from '../../../redux/actions';
import { PgpKeys } from '../../../bloben-package/utils/OpenPgp';
import CalendarContent from '../calendarContent/CalendarContent';
import EditCalendar from '../editCalendar/EditCalendar';
import { getLocalTimezone } from '../../../bloben-package/utils/common';

const NewCalendar = () => {
  const [calendarState, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { name, color, reminders, isShared, isPublic, timezone } = calendarState;
  const history = useHistory();

  const dispatch: any = useDispatch();
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);

  const setLocalState = (stateName: string, type: string, data: any): void => {
    const payload: any = { stateName, type, data };
    // @ts-ignore
    dispatchState({ calendarState, payload });
  };

  const handleChange = (event: any) => {
    const target = event.target;
    setLocalState(target.name, 'simple', event.target.value);
  };

  const selectColor = (colorValue: any) => {
    setLocalState('color', 'simple', colorValue);
  };

  const selectTimezone = (timezoneValue: string) =>
      setLocalState('timezone', 'simple', timezoneValue)

  const addNotificationCalendar = (item: any) => {
    addNotification(item, setLocalState, reminders);
  };

  const removeNotificationCalendar = (item: any) => {
    removeNotification(item, setLocalState, reminders);
  };

  useEffect(() => {
    setLocalState('timezone', 'simple', getLocalTimezone())
  },[])

  const saveCalendar = async () => {
    const newCalendar: CalendarStateEntity = new CalendarStateEntity(calendarState);

    // Encrypt data
    const bodyToSend: CalendarBodyToSend =
      pgpKeys && pgpKeys.publicKey
        ? await newCalendar.formatBodyToSendPgp(pgpKeys.publicKey)
        : await newCalendar.formatBodyToSend(cryptoPassword);

    // Save to redux store
    dispatch(addCalendar(newCalendar.getStoreObj()));

    // setState('calendars', 'create', enhancedState);
    stompClient.send('/app/calendars/create', {}, JSON.stringify(bodyToSend));

    history.goBack();
  };

  return (
    <CalendarContent
      calendarState={calendarState}
      handleChange={handleChange}
      selectColor={selectColor}
      saveCalendar={saveCalendar}
      reminders={reminders}
      addNotification={addNotificationCalendar}
      removeNotification={removeNotificationCalendar}
      isNewCalendar={true}
      selectTimezone={selectTimezone}
      timezone={timezone}
    />
  );
};

export default NewCalendar;
