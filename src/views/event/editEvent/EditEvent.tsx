import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import React, { useContext, useEffect, useReducer, useState } from 'react';

import {
  AddAlarmData,
  AppAlarm,
  addAlarm,
  createToast,
  formatAppAlarm,
  getLocalTimezone,
  removeAlarm,
  updateAlarm,
} from '../../../utils/common';

// @ts-ignore
import { stateReducer } from '../../../utils/reducer/baseReducer';
import EventDetail from '../eventDetail/EventDetail';

import { Attendee } from '../../../utils/AttendeeUtils';
import {
  CalDavCalendar,
  CalDavEvent,
  ReduxState,
} from '../../../types/interface';
import { Context, StoreContext } from '../../../context/store';
import { DatetimeParser, parseToDateTime } from '../../../utils/datetimeParser';
import { Flex, Spacer, useToast } from '@chakra-ui/react';
import { TOAST_STATUS } from '../../../types/enums';

import { CalendarSettingsResponse } from '../../../bloben-interface';
import {
  checkIfHasRepeatPreAction,
  handleSaveEvent,
  handleSelectCalendar,
  initNewEventOnMount,
  initialFormState,
  initialState,
  loadCalendar,
  loadEvent,
  updateRepeatedEvent,
  validateDate,
} from './editEventHelper';

import { PrimaryButton, Separator } from 'bloben-components';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../enums';
import { filter, map } from 'lodash';
import ModalNew from '../../../components/modalNew/ModalNew';

import { CALDAV_COMPONENTS, EVENT_TYPE } from '../../../bloben-interface/enums';
import { handleSaveTask } from './editTaskHelper';
import ButtonStack, {
  eventTypeItems,
} from '../../../components/buttonStack/ButtonStack';
import RepeatEventModal, {
  REPEAT_MODAL_TYPE,
} from '../../../components/repeatEventModal/RepeatEventModal';
import SendInviteModal from '../../../components/sendInviteModalModal/SendInviteModal';
import TaskDetail from '../taskDetail/TaskDetail';

interface EditEventProps {
  handleClose: any;
  isNewEvent: boolean;
  newEventTime?: any;
  defaultReminder?: any; // Remove?
  event?: CalDavEvent;
  wasInitRef?: any;
  currentE: any;
  isDuplicatingEvent?: boolean;
}

const EditEvent = (props: EditEventProps) => {
  const toast = useToast();

  // Redux state
  const calDavCalendarsRedux: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const user = useSelector((state: ReduxState) => state.user);
  const settings: CalendarSettingsResponse = useSelector(
    (state: ReduxState) => state.calendarSettings
  );

  const [eventState] = useReducer(stateReducer, initialState);

  const [form, dispatchForm]: any = useReducer(
    stateReducer,
    initialFormState as any
  );
  const [calendar, setCalendar] = useState(null as any);
  const [isSaving, setIsSaving] = useState(false);
  const [repeatChangeValue, setRepeatChangeValue] = useState<any>(null);
  const [wasSimpleEvent, setWasSimpleEvent] = useState(true);
  const [emailInviteModalVisible, openEmailInviteModal] = useState<any>(null);
  const [type, setType] = useState<EVENT_TYPE>(EVENT_TYPE.EVENT);
  const [calDavCalendars, setCalDavCalendars] =
    useState<CalDavCalendar[]>(calDavCalendarsRedux);

  const filterCalendars = (eventType?: EVENT_TYPE) => {
    if (eventType) {
      setType(eventType);
    }
    const typeValue = eventType || type;
    if (typeValue === EVENT_TYPE.EVENT) {
      const result = filter(calDavCalendarsRedux, (calendar) =>
        calendar.components.includes(CALDAV_COMPONENTS.VEVENT)
      );
      setCalDavCalendars(result);
    } else {
      const result = filter(calDavCalendarsRedux, (calendar) =>
        calendar.components.includes(CALDAV_COMPONENTS.VTODO)
      );
      setCalDavCalendars(result);
    }
  };

  useEffect(() => {
    filterCalendars();
  }, [type]);

  const [store, dispatchContext]: [StoreContext, any] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const setForm = (type: any, payload: any) => {
    if (type === 'rRule') {
      const needSlice = payload.includes('RRULE');

      let customPayload = payload;

      if (needSlice) {
        customPayload = payload.slice(6);
      }

      const data = {
        type,
        payload: customPayload,
      };

      // @ts-ignore
      dispatchForm(data);

      return;
    }
    // @ts-ignore
    dispatchForm({ type, payload });
  };

  const { isNewEvent, newEventTime, handleClose, event, isDuplicatingEvent } =
    props;

  const { isStartDateValid } = eventState as unknown as any;

  const {
    summary,
    location,
    description,
    calendarID,
    allDay,
    startAt,
    endAt,
    isRepeated,
    alarms,
    timezoneStartAt,
    attendees,
    organizer,
    rRule,
    color,
  } = form as any;

  const showRepeatEventModal =
    checkIfHasRepeatPreAction(form) &&
    !repeatChangeValue &&
    !isNewEvent &&
    !wasSimpleEvent;

  const showEmailInviteModal =
    form?.attendees?.length &&
    (store?.emailConfig?.hasSystemConfig ||
      store?.emailConfig?.hasCustomConfig);

  useEffect(() => {
    if (isNewEvent) {
      initNewEventOnMount(
        settings,
        calDavCalendars,
        setForm,
        setCalendar,
        store,
        user,
        newEventTime
      );
    } else {
      filterCalendars(event?.type);
      loadEvent(event, setForm, setWasSimpleEvent);
    }
  }, [isNewEvent]);

  useEffect(() => {
    loadCalendar(
      calendarID,
      props.event,
      calDavCalendars,
      settings,
      isNewEvent,
      setForm,
      setCalendar
    );
  }, [calendarID]);

  const addAlarmEvent = (item: AddAlarmData) => {
    addAlarm(item, setForm, alarms);
  };

  const removeAlarmEvent = (item: AppAlarm) => {
    removeAlarm(item, setForm, alarms);
  };
  const updateAlarmEvent = (item: AppAlarm) => {
    updateAlarm(item, setForm, alarms);
  };

  /**
   * Attendees
   * @param item
   */
  const addAttendee = (item: Attendee) => {
    setForm('attendees', [...attendees, item]);
  };
  const removeAttendee = (item: Attendee) => {
    const attendeeFiltered: any = [...attendees].filter(
      (attendee: any) => attendee.mailto !== item.mailto
    );
    setForm('attendees', attendeeFiltered);
  };

  const updateAttendee = (item: Attendee) => {
    const updatedAttendees = attendees.map((attendee: Attendee) => {
      if (item.mailto === attendee.mailto) {
        return item;
      } else {
        return attendee;
      }
    });

    setForm('attendees', updatedAttendees);
  };

  /**
   * Validate startAt date before change
   * @param dateValue
   */
  const handleChangeDateFrom = (dateValue: DateTime | string) => {
    const timezoneBase = settings.timezone || getLocalTimezone();
    setForm('startAt', DatetimeParser(dateValue, timezoneBase));

    const isDateValid: boolean = validateDate(
      'startAt',
      dateValue,
      endAt,
      allDay
    );

    if (!isDateValid) {
      const originalDateTill = parseToDateTime(endAt, timezoneBase);
      setForm(
        'endAt',
        DatetimeParser(
          parseToDateTime(dateValue, timezoneBase).set({
            hour: originalDateTill.hour,
            minute: originalDateTill.minute,
          }),
          timezoneBase
        )
      );
    }
  };

  /**
   * Validate endAt date before change
   * @param dateValue
   */
  const handleChangeDateTill = (dateValue: any) => {
    const timezoneBase = settings.timezone || getLocalTimezone();

    const isDateValid: boolean = validateDate(
      'endAt',
      startAt,
      dateValue,
      allDay
    );

    if (isDateValid) {
      setForm('endAt', DatetimeParser(dateValue, timezoneBase));
    } else {
      toast(createToast('Invalid date', TOAST_STATUS.ERROR));
    }
  };

  const handleChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    const value: any = event.target.value;

    if (name === 'timezoneStartAt' || name === 'timezoneEndAt') {
      setForm('startAt', DatetimeParser(startAt, value));
      setForm('endAt', DatetimeParser(endAt, value));
    }

    setForm(name, value);
  };

  const selectCalendar = (calendarObj: any) => {
    handleSelectCalendar(
      calendarObj,
      setForm,
      setCalendar,
      startAt,
      endAt,
      settings
    );
  };

  const saveEvent = async () => {
    if (type === EVENT_TYPE.EVENT) {
      await handleSaveEvent(
        showEmailInviteModal,
        openEmailInviteModal,
        form as any,
        isNewEvent,
        calendar,
        handleClose,
        props.event,
        settings.timezone || getLocalTimezone(),
        isDuplicatingEvent,
        setContext,
        store,
        wasSimpleEvent,
        setIsSaving,
        handleUpdateRepeatedEvent,
        toast
      );
    } else {
      await handleSaveTask(
        showEmailInviteModal,
        openEmailInviteModal,
        form as any,
        isNewEvent,
        calendar,
        handleClose,
        props.event,
        settings.timezone || getLocalTimezone(),
        isDuplicatingEvent,
        setContext,
        store,
        wasSimpleEvent,
        setIsSaving,
        handleUpdateRepeatedEvent,
        toast
      );
    }
  };

  const handleUpdateRepeatedEvent = async () => {
    const eventForm = form;

    if (eventForm.alarms?.length) {
      eventForm.alarms = map(alarms, formatAppAlarm);
    }
    // @ts-ignore
    eventForm.externalID = props.event?.externalID;

    if (showEmailInviteModal) {
      openEmailInviteModal({
        call: async (sendInvite?: boolean, inviteMessage?: string) => {
          await updateRepeatedEvent(
            eventForm,
            repeatChangeValue,
            calendar,
            undefined,
            props.event,
            sendInvite,
            inviteMessage
          );
        },
      });
    } else {
      await updateRepeatedEvent(
        eventForm,
        repeatChangeValue,
        calendar,
        undefined,
        props.event
      );
    }

    setRepeatChangeValue(null);
  };

  return (
    <>
      {showRepeatEventModal ? (
        <RepeatEventModal
          type={REPEAT_MODAL_TYPE.UPDATE}
          handleClose={handleClose}
          title={''}
          handleClick={(value: REPEATED_EVENT_CHANGE_TYPE) => {
            setRepeatChangeValue(value);
          }}
        />
      ) : null}
      {emailInviteModalVisible ? (
        <SendInviteModal
          handleClose={handleClose}
          clickData={emailInviteModalVisible}
        />
      ) : null}
      {!showRepeatEventModal && !emailInviteModalVisible ? (
        <ModalNew
          handleClose={handleClose}
          className={'EditEventModal'}
          preventCloseOnBackdrop={true}
          closeButton={true}
          footer={
            <>
              <ButtonStack
                style={{ marginLeft: 16 }}
                items={eventTypeItems}
                onClick={setType}
                selectedValue={type}
                disabled={!isNewEvent}
              />
              <Spacer />
              <Flex direction={'row'} style={{ marginTop: 2 }}>
                <Spacer />
                <PrimaryButton isSecondary onClick={handleClose}>
                  Cancel
                </PrimaryButton>
                <Separator width={6} />
                <PrimaryButton
                  onClick={saveEvent}
                  disabled={isSaving}
                  isLoading={isSaving}
                >
                  Save
                </PrimaryButton>
              </Flex>
            </>
          }
        >
          <>
            <Flex
              direction={'column'}
              style={{ overflowY: 'auto', overflowX: 'hidden' }}
            >
              <Flex direction={'column'} style={{ paddingRight: 8 }}>
                {type === EVENT_TYPE.EVENT &&
                calendar?.url &&
                startAt &&
                endAt ? (
                  <EventDetail
                    isNewEvent={isNewEvent}
                    calendar={calendar}
                    summary={summary}
                    location={location}
                    description={description}
                    startDate={startAt}
                    rRule={rRule}
                    endDate={endAt}
                    repeatChangeValue={repeatChangeValue}
                    isRepeated={isRepeated}
                    handleChange={handleChange}
                    disabledRRule={
                      !wasSimpleEvent &&
                      repeatChangeValue !== REPEATED_EVENT_CHANGE_TYPE.ALL
                    }
                    disabledAttendeeChange={
                      !wasSimpleEvent &&
                      repeatChangeValue !== REPEATED_EVENT_CHANGE_TYPE.ALL
                    }
                    allDay={allDay}
                    setForm={setForm}
                    handleChangeDateFrom={handleChangeDateFrom}
                    handleChangeDateTill={handleChangeDateTill}
                    isStartDateValid={isStartDateValid}
                    alarms={alarms}
                    addAlarm={addAlarmEvent}
                    removeAlarm={removeAlarmEvent}
                    updateAlarm={updateAlarmEvent}
                    timezoneStartAt={timezoneStartAt}
                    selectCalendar={selectCalendar}
                    attendees={attendees}
                    addAttendee={addAttendee}
                    removeAttendee={removeAttendee}
                    updateAttendee={updateAttendee}
                    color={color || calendar.color}
                    // makeOptional={makeOptional}
                    organizer={organizer}
                    form={form}
                  />
                ) : (
                  <div />
                )}
                {type === EVENT_TYPE.TASK && calendar?.url && startAt ? (
                  <TaskDetail
                    isNewEvent={isNewEvent}
                    calendar={calendar}
                    summary={summary}
                    description={description}
                    startDate={startAt}
                    rRule={rRule}
                    repeatChangeValue={repeatChangeValue}
                    isRepeated={isRepeated}
                    handleChange={handleChange}
                    disabledRRule={
                      !wasSimpleEvent &&
                      repeatChangeValue !== REPEATED_EVENT_CHANGE_TYPE.ALL
                    }
                    allDay={allDay}
                    setForm={setForm}
                    handleChangeDateFrom={handleChangeDateFrom}
                    isStartDateValid={isStartDateValid}
                    alarms={alarms}
                    addAlarm={addAlarmEvent}
                    removeAlarm={removeAlarmEvent}
                    updateAlarm={updateAlarmEvent}
                    selectCalendar={selectCalendar}
                    form={form}
                  />
                ) : (
                  <div />
                )}
              </Flex>
            </Flex>
          </>
        </ModalNew>
      ) : null}
    </>
  );
};

export default EditEvent;
