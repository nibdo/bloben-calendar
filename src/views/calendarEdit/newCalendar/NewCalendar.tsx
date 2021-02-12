import React, { useEffect, useReducer } from 'react';
import { useHistory } from 'react-router';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../CalendarEdit.utils';
import CalendarStateEntity, {
  CalendarBodyToSend,
} from '../../../data/models/state/calendar.entity';
import { addAlarm, removeAlarm } from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { stompClient } from '../../../layers/AuthenticatedLayer';
import { addCalendar } from '../../../redux/actions';
import { PgpKeys } from '../../../bloben-utils/utils/OpenPgp';
import CalendarContent from '../calendarContent/CalendarContent';
import EditCalendar from '../editCalendar/EditCalendar';
import { getLocalTimezone } from '../../../bloben-package/utils/common';
import CalendarApi from '../../../api/calendar';

const NewCalendar = () => {
  const [calendarState, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { name, color, alarms, isShared, isPublic, timezone } = calendarState;
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

  const addAlarmCalendar = (item: any) => {
    addAlarm(item, setLocalState, alarms);
  };

  const removeAlarmCalendar = (item: any) => {
    removeAlarm(item, setLocalState, alarms);
  };

  useEffect(() => {
    setLocalState('timezone', 'simple', getLocalTimezone())
  },[])

  const saveCalendar = async () => {
    const newCalendar: CalendarStateEntity = new CalendarStateEntity(calendarState);

    // Encrypt data
    const bodyToSend: any = await newCalendar.formatBodyToSendPgp(pgpKeys.publicKey)

    // Save to redux store
    dispatch(addCalendar(newCalendar.getStoreObj()));

    await CalendarApi.createCalendar(bodyToSend);

    history.goBack();
  };

  return (
    <CalendarContent
      calendarState={calendarState}
      handleChange={handleChange}
      selectColor={selectColor}
      saveCalendar={saveCalendar}
      alarms={alarms}
      addAlarm={addAlarmCalendar}
      removeAlarm={removeAlarmCalendar}
      isNewCalendar={true}
      selectTimezone={selectTimezone}
      timezone={timezone}
    />
  );
};

export default NewCalendar;
