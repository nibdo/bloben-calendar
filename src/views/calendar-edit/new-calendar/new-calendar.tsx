import React, { useReducer } from 'react';
import { useHistory, useParams } from 'react-router';
import CalendarContent from '../calendar-content/calendar-content';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../calendar-edit.utils';
import CalendarStateEntity, { CalendarBodyToSend } from '../../../data/entities/state/calendar.entity';
import { addNotification, removeNotification } from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { stompClient } from '../../../layers/authenticated-layer';
import { addCalendar, mergeEvent } from '../../../redux/actions';
import {PgpKeys} from "../../../bloben-package/utils/OpenPgp";

const NewCalendar = (props: any) => {
  const [state, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { name, color, reminders, isShared, isPublic } = state;
  const history = useHistory();

  const dispatch: any = useDispatch();
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const password: string = useSelector((state: any) => state.password);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);

  const setLocalState = (stateName: string, type: string, data: any): void => {
    const payload: any = { stateName, type, data };
    // @ts-ignore
    dispatchState({ state, payload });
  };

  const handleChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    setLocalState(name, 'simple', event.target.value);
  };

  const selectColor = (color: any) => {
    setLocalState('color', 'simple', color);
  };

  const addNotificationCalendar = (item: any) => {
    addNotification(item, setLocalState, reminders);
  }

  const removeNotificationCalendar = (item: any) => {
    removeNotification(item, setLocalState, reminders)
  }

  const saveCalendar = async () => {
    const newCalendar: CalendarStateEntity = new CalendarStateEntity(state);

    // Encrypt data
    const bodyToSend: CalendarBodyToSend = cryptoPassword
        ? await newCalendar.formatBodyToSend(cryptoPassword)
        : await newCalendar.formatBodyToSendPgp(pgpKeys.publicKey);

    // Save to redux store
    dispatch(addCalendar(newCalendar));

    // setState('calendars', 'create', enhancedState);
    stompClient.send(`/app/calendars/create`, {}, JSON.stringify(bodyToSend)
    );

    history.goBack();
  };

  return (
    <CalendarContent
      state={state}
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
