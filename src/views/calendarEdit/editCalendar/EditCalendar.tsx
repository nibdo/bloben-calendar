import React, { useEffect, useReducer } from 'react';
import { useHistory, useParams } from 'react-router';
import CalendarContent from '../calendarContent/CalendarContent';
import StateReducer from '../../../utils/state-reducer';
import Utils from '../CalendarEdit.utils';
import CalendarStateEntity, {
  CalendarBodyToSend,
} from '../../../data/entities/state/calendar.entity';
import {
  addNotification,
  findInArrayById,
  handleCalendarReduxDelete,
  removeNotification,
} from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendWebsocketMessage,
  WEBSOCKET_DELETE_CALENDAR,
  WEBSOCKET_UPDATE_CALENDAR,
} from '../../../api/calendar';
import { updateCalendar } from '../../../redux/actions';
import { PgpKeys } from '../../../bloben-package/utils/OpenPgp';
import { logger } from '../../../bloben-common/utils/common';
import { getLocalTimezone } from '../../../bloben-package/utils/common';

const EditCalendar = () => {
  const dispatch = useDispatch();
  const [calendarState, dispatchState]: any = useReducer(
    StateReducer,
    Utils.initialState
  );
  const { name, color, reminders, timezone } = calendarState;
  const history = useHistory();
  const params: any = useParams();
  const { id } = params;
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const calendars: any = useSelector((state: any) => state.calendars);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);
  const defaultCalendar: string = useSelector(
      (state: any) => state.defaultCalendar
  );

  // Init props of selected calendar
  const initEditCalendar = async () => {
    // Find calendar
    const thisCalendar: CalendarStateEntity = await findInArrayById(
      calendars,
      id
    );

    if (!thisCalendar) {
      // TODO error msg
    }

    // Set data
    for (const [key, value] of Object.entries(thisCalendar)) {
      if (key === 'reminders' && !value) {
        setLocalState(key, 'simple', []);
      } else if (key === 'timezone' && !value) {
        setLocalState(key, 'simple', getLocalTimezone())
      } else {
        setLocalState(key, 'simple', value);
      }
    }
  };

  /**
   * Init new view on id change
   */
  useEffect(() => {
    initEditCalendar();
  }, [id]);

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

  const deleteCalendar = () => {
    if (params.id === defaultCalendar || !defaultCalendar) {
      logger('Error: Can\'t delete default calendar')

      return;
    }
    sendWebsocketMessage(WEBSOCKET_DELETE_CALENDAR, { id: params.id });
    handleCalendarReduxDelete(params.id);

    history.goBack();
  };

  const saveCalendar = async () => {
    const stateData: any = new CalendarStateEntity(calendarState);

    // Encrypt data
    const bodyToSend: CalendarBodyToSend =
      pgpKeys && pgpKeys.publicKey
        ? await stateData.formatBodyToSendPgp(pgpKeys.publicKey)
        : await stateData.formatBodyToSend(cryptoPassword);

    dispatch(updateCalendar(stateData.getStoreObj()));

    sendWebsocketMessage(WEBSOCKET_UPDATE_CALENDAR, bodyToSend);

    history.goBack();
  };

  return (
    <CalendarContent
      calendarState={calendarState}
      handleChange={handleChange}
      selectColor={selectColor}
      saveCalendar={saveCalendar}
      reminders={reminders}
      timezone={timezone}
      addNotification={addNotificationCalendar}
      removeNotification={removeNotificationCalendar}
      deleteCalendar={deleteCalendar}
      calendarId={params.id}
      isNewCalendar={false}
      selectTimezone={selectTimezone}
    />
  );
};

export default EditCalendar;
