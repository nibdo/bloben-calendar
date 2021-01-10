import React, { useReducer } from 'react';
import { useHistory } from 'react-router';
import CalendarContent from '../calendarContent/CalendarContent';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../calendar-edit.utils';
import CalendarStateEntity, {
  CalendarBodyToSend,
} from '../../../data/entities/state/calendar.entity';
import { addNotification, removeNotification } from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { stompClient } from '../../../layers/authenticated-layer';
import { addCalendar } from '../../../redux/actions';
import { PgpKeys } from '../../../bloben-package/utils/OpenPgp';

const NewCalendar = () => {
  const [calendarState, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { name, color, reminders, isShared, isPublic } = calendarState;
  const history = useHistory();

  const dispatch: any = useDispatch();
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);

  const setLocalState = (stateName: string, type: string, data: any): void => {
    const payload: any = { stateName, type, data };
    // @ts-ignore
    dispatchState({ state, payload });
  };

  const handleChange = (event: any) => {
    const target = event.target;
    setLocalState(target.name, 'simple', event.target.value);
  };

  const selectColor = (color: any) => {
    setLocalState('color', 'simple', color);
  };

  const addNotificationCalendar = (item: any) => {
    addNotification(item, setLocalState, reminders);
  };

  const removeNotificationCalendar = (item: any) => {
    removeNotification(item, setLocalState, reminders);
  };

  const saveCalendar = async () => {
    const newCalendar: CalendarStateEntity = new CalendarStateEntity(
      calendarState
    );

    // Encrypt data
    const bodyToSend: CalendarBodyToSend =
      pgpKeys && pgpKeys.publicKey
        ? await newCalendar.formatBodyToSendPgp(pgpKeys.publicKey)
        : await newCalendar.formatBodyToSend(cryptoPassword);

    // Save to redux store
    dispatch(addCalendar(newCalendar));

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
    />
  );
};

export default NewCalendar;
