import React, { useEffect, useReducer } from 'react';
import { useHistory, useParams } from 'react-router';
import CalendarContent from '../calendar-content/calendar-content';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../calendar-edit.utils';
import CalendarStateEntity, { CalendarBodyToSend } from '../../../data/entities/state/calendar.entity';
import {
  addNotification,
  findInArrayById, handleCalendarReduxDelete,
  removeNotification,
} from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { stompClient } from '../../../layers/authenticated-layer';
import {
  sendWebsocketMessage,
  WEBSOCKET_DELETE_CALENDAR,
  WEBSOCKET_UPDATE_CALENDAR
} from '../../../api/calendar';
import { updateCalendar } from '../../../redux/actions';

const EditCalendar = (props: any) => {
  const dispatch = useDispatch();
  const [state, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { name, color, reminders } = state;
  const history = useHistory();
  const params: any = useParams();
  const {id} = params;
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const calendars: any = useSelector((state: any) => state.calendars);


  // Init props of selected calendar
  const initEditCalendar = async () => {
    // Find calendar
    const thisCalendar: CalendarStateEntity = await findInArrayById(calendars, id);

    if (!thisCalendar) {
      // TODO error msg
    }

    // Set data
    for (const [key, value] of Object.entries(thisCalendar)) {
      setLocalState(key, 'simple', value)
    }
  }

  /**
   * Init new view on id change
    */
  useEffect(() => {
    initEditCalendar()
  }, [id])


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

  const deleteCalendar = () => {
    sendWebsocketMessage(WEBSOCKET_DELETE_CALENDAR, {id: params.id})
    handleCalendarReduxDelete(params.id)

    history.goBack();
  }

  const saveCalendar = async () => {
    const stateData: any = new CalendarStateEntity(
      state,
    );

  // Encrypt data
    const bodyToSend: CalendarBodyToSend = await stateData.formatBodyToSend(cryptoPassword);

    dispatch(updateCalendar(stateData.getStoreObj()));

    sendWebsocketMessage(WEBSOCKET_UPDATE_CALENDAR, bodyToSend)

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
      deleteCalendar={deleteCalendar}
      calendarId={params.id}
    />
  );
};

export default EditCalendar;
