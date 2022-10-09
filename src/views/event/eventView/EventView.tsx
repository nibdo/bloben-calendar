import './EventView.scss';

/* tslint:disable:no-magic-numbers */
import { useSelector } from 'react-redux';
import React, { useContext, useEffect, useState } from 'react';

import {
  CalDavCalendar,
  CalDavEvent,
  ReduxState,
} from '../../../types/interface';
import {
  createToast,
  formatEventDate,
  getLocalTimezone,
} from '../../../utils/common';

import { AxiosResponse } from 'axios';
import { CalendarEvent } from 'kalend';
import {
  CommonResponse,
  DeleteRepeatedCalDavEventRequest,
} from '../../../bloben-interface';
import { Context, StoreContext } from '../../../context/store';
import {
  EVENT_TYPE,
  SOURCE_TYPE,
  TASK_STATUS,
} from '../../../bloben-interface/enums';
import { EvaIcons, createToastError } from 'bloben-components';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../enums';
import { Stack, Text, useToast } from '@chakra-ui/react';
import { WebcalCalendar } from '../../../redux/reducers/webcalCalendars';
import { calendarByEvent } from '../../../utils/tsdavHelper';
import { parseTimezone } from '../../../utils/dates';
import { v4 } from 'uuid';
import CalDavEventsApi from '../../../api/CalDavEventsApi';
import EventDetailAttendee from '../../../components/eventDetail/eventDetailAttendee/EventDetailAttendee';
import EventDetailCalendar from '../../../components/eventDetail/eventDetailCalendar/EventDetailCalendar';
import EventDetailLocation from '../../../components/eventDetail/eventDetailLocation/EventDetailLocation';
import EventDetailNotes from '../../../components/eventDetail/eventDetailNotes/EventDetailNotes';
import EventDetailTitle from '../../../components/eventDetail/eventDetailTitle/EventDetailTitle';
import FormIcon from '../../../components/formIcon/FormIcon';
import HeaderModal from '../../../components/headerModal/HeaderModal';
import ICalHelper from '../../../utils/ICalHelper';
import ICalHelperTasks from '../../../utils/ICalHelperTasks';
import Modal from '../../../components/modal/Modal';
import RepeatEventModal, {
  REPEAT_MODAL_TYPE,
} from '../../../components/repeatEventModal/RepeatEventModal';
import SendInviteModal from '../../../components/sendInviteModalModal/SendInviteModal';
import TasksApi from '../../../api/TasksApi';

export const checkIfHasRepeatPreAction = (event: any) => {
  return (
    event?.rRule?.length > 1 ||
    event?.recurrenceID ||
    event?.recurrenceID?.value
  );
};

interface EventDatesProps {
  event: CalendarEvent;
  isSmall?: boolean;
}
const EventDates = (props: EventDatesProps) => {
  const { event } = props;

  const [store]: [StoreContext] = useContext(Context);
  const { isDark, isMobile } = store;

  const settings = useSelector((state: ReduxState) => state.calendarSettings);
  const timezone = parseTimezone(event.timezoneStartAt, settings.timezone);

  const humanDate: any = formatEventDate(event, timezone);
  const { dates, time } = humanDate;

  return !isMobile ? (
    <Stack direction={'row'} align={'center'}>
      <FormIcon desktopVisible isDark={isDark}>
        <EvaIcons.Clock className={'EventDetail-icon'} />
      </FormIcon>
      <Text>{dates}</Text>
      {event.allDay ? null : <Text>{time}</Text>}
    </Stack>
  ) : (
    <Stack direction={'column'} align={'flex-start'}>
      <Stack direction={'row'} align={'center'}>
        <FormIcon allVisible isDark={isDark}>
          <EvaIcons.Clock className={'EventDetail-icon'} />
        </FormIcon>
        <Text>{dates}</Text>
      </Stack>
      {!event.allDay ? (
        <Stack direction={'row'} align={'center'}>
          <FormIcon hidden isDark={isDark}>
            <EvaIcons.Clock className={'EventDetail-icon'} />
          </FormIcon>
          <Text>{time}</Text>
        </Stack>
      ) : null}
    </Stack>
  );
};

interface EventViewProps {
  data: CalDavEvent;
  handleClose: any;
  openEditEventModal: any;
  currentE: any;
  disabledEdit?: boolean;
  openDuplicateModal?: any;
}

const EventView = (props: EventViewProps) => {
  const toast = useToast();

  const [store, dispatchContext]: [StoreContext, any] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const {
    handleClose,
    openEditEventModal,
    currentE,
    disabledEdit,
    openDuplicateModal,
  } = props;

  const { isDark, isMobile } = store;

  const settings = useSelector((state: ReduxState) => state.calendarSettings);
  const timezone = settings.timezone || getLocalTimezone();

  // const [isOrganizer, setIsOrganizer] = useState(false);
  const [event, setEvent] = useState(null as any);
  const [calendar, setCalendar] = useState(null as any);
  const [deleteModalOpen, openDeleteModal] = useState(false);
  const [emailInviteModalVisible, openEmailInviteModal] = useState<any>(null);

  const calendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const webcalCalendars: WebcalCalendar[] = useSelector(
    (state: ReduxState) => state.webcalCalendars
  );

  const getCalendar = async () => {
    const thisCalendar: any = calendarByEvent(props.data, calendars);
    if (thisCalendar) {
      setCalendar(thisCalendar);
    } else {
      const webcalCalendar: any = calendarByEvent(props.data, webcalCalendars);
      if (webcalCalendar) {
        setCalendar({ ...webcalCalendar, displayName: webcalCalendar.name });
      }
    }
  };

  const loadEvent = async (): Promise<void> => {
    setEvent(props.data);
  };

  const handleEdit = (duplicateEvent?: boolean) => {
    openEditEventModal(event, duplicateEvent);
    handleClose();
  };

  const showEmailInviteModal =
    event?.attendees?.length &&
    (store?.emailConfig?.hasSystemConfig ||
      store?.emailConfig?.hasCustomConfig);

  const deleteEvent = async () => {
    if (checkIfHasRepeatPreAction(event) && !deleteModalOpen) {
      openDeleteModal(true);
      return;
    }

    if (showEmailInviteModal) {
      openEmailInviteModal({
        call: async (sendInvite?: boolean, inviteMessage?: string) => {
          if (event.type === EVENT_TYPE.TASK) {
            await TasksApi.delete({
              calendarID: calendar.id,
              url: event.url,
              etag: event.etag,
              id: event.id,
              sendInvite,
              inviteMessage,
            });
          } else {
            await CalDavEventsApi.deleteEvent({
              calendarID: calendar.id,
              url: event.url,
              etag: event.etag,
              id: event.id,
              sendInvite,
              inviteMessage,
            });
          }
        },
      });

      openDeleteModal(false);

      return;
    }

    try {
      let response: AxiosResponse<CommonResponse>;

      if (event.type === EVENT_TYPE.TASK) {
        response = await TasksApi.delete({
          calendarID: calendar.id,
          url: event.url,
          etag: event.etag,
          id: event.id,
        });
      } else {
        response = await CalDavEventsApi.deleteEvent({
          calendarID: calendar.id,
          url: event.url,
          etag: event.etag,
          id: event.id,
        });
      }
      if (response.status === 200 || response.status === 204) {
        setContext('syncSequence', store.syncSequence + 1);
        toast(createToast(response.data.message));

        handleClose();
      }
    } catch (e: any) {
      toast(createToastError(e));
    }
  };

  const handleDeleteRepeated = async (value: REPEATED_EVENT_CHANGE_TYPE) => {
    try {
      // use issued id or create for new event
      const newEventExternalID: string = event?.externalID || v4();

      let iCalString: string | null;

      let response;
      let body: DeleteRepeatedCalDavEventRequest | null = null;

      if (value === REPEATED_EVENT_CHANGE_TYPE.SINGLE) {
        if (event.recurrenceID || event.recurrenceID?.value) {
          body = {
            calendarID: calendar.id,
            url: event.url,
            etag: event.etag,
            id: event.id,
            type: REPEATED_EVENT_CHANGE_TYPE.SINGLE_RECURRENCE_ID,
            recurrenceID: event.recurrenceID,
          };
        } else {
          const originalEvent = await CalDavEventsApi.getEvent(
            calendar.id,
            event.url
          );
          iCalString = new ICalHelper(
            {
              ...event,
              startAt: originalEvent.data.startAt,
              endAt: originalEvent.data.endAt,
              timezoneStart: originalEvent.data.timezoneStart,
              externalID: newEventExternalID,
              rRule: originalEvent.data.rRule,
              recurrenceID: {
                value: event.startAt,
                timezone: event.timezoneStartAt,
              },
              exdates: [
                ...event.exdates,
                { value: event.startAt, timezone: event.timezoneStartAt },
              ],
            },
            timezone
          ).parseTo();

          body = {
            calendarID: calendar.id,
            url: event.url,
            etag: event.etag,
            id: event.id,
            type: value,
            // @ts-ignore
            iCalString: iCalString ? iCalString : null,
            recurrenceID: {
              value: event.startAt,
              timezone: event.timezoneStartAt,
            },
            exDates: [
              ...event.exdates,
              { value: event.startAt, timezone: event.timezoneStartAt },
            ],
          };
        }
      } else if (value === REPEATED_EVENT_CHANGE_TYPE.ALL) {
        body = {
          calendarID: calendar.id,
          url: event.url,
          etag: event.etag,
          id: event.id,
          type: value,
        };
      }

      if (!body) {
        return;
      }

      if (showEmailInviteModal) {
        openDeleteModal(false);

        openEmailInviteModal({
          call: async (sendInvite?: boolean, inviteMessage?: string) => {
            await CalDavEventsApi.deleteRepeatedEvent({
              ...(body as DeleteRepeatedCalDavEventRequest),
              sendInvite: sendInvite || false,
              inviteMessage: inviteMessage,
            });
          },
        });

        return;
      } else {
        response = await CalDavEventsApi.deleteRepeatedEvent(body);
      }

      if (response?.status === 200 || response?.status === 204) {
        setContext('syncSequence', store.syncSequence + 1);

        toast(createToast('Event deleted'));

        handleClose();
      }
    } catch (e: any) {
      toast(createToastError(e));
    }

    openDeleteModal(false);
  };

  useEffect(() => {
    loadEvent();
    getCalendar();
  }, [JSON.stringify(props.data)]);

  const showDeleteEventModal =
    checkIfHasRepeatPreAction(event) && deleteModalOpen;

  const handleCheckTask = async () => {
    toast({ ...createToast('Updating'), id: 'taskCheck', isClosable: false });
    try {
      const externalID = event.externalID;
      const iCalString: string = new ICalHelperTasks(
        {
          ...event,
          status: event.status === 'COMPLETED' ? 'NEEDS-ACTION' : 'COMPLETED',
        },
        settings.timezone
      ).parseTo();

      const response = await TasksApi.update({
        iCalString,
        calendarID: event.calendarID,
        externalID,
        id: event.id,
        etag: event.etag,
        url: event.url,
        prevEvent: null,
      });

      toast.close('taskCheck');
      toast(createToast(response?.data?.message));
      handleClose();
    } catch (e) {
      toast.close('taskCheck');
      toast({ ...createToastError(e), id: 'checkTask' });
    }
  };

  const isTask = event?.type === EVENT_TYPE.TASK;

  return (
    <>
      {emailInviteModalVisible ? (
        <SendInviteModal
          handleClose={handleClose}
          clickData={emailInviteModalVisible}
        />
      ) : null}
      {showDeleteEventModal ? (
        <RepeatEventModal
          type={REPEAT_MODAL_TYPE.DELETE}
          handleClose={handleClose}
          title={''}
          handleClick={handleDeleteRepeated}
        />
      ) : null}
      {!showDeleteEventModal &&
      !emailInviteModalVisible &&
      event &&
      event.id ? (
        <Modal e={currentE} handleClose={handleClose} maxHeight={'42%'}>
          <div style={{ padding: isMobile ? 8 : 0 }}>
            {event.sourceType === SOURCE_TYPE.CALDAV && !disabledEdit ? (
              <HeaderModal
                isMobile={isMobile}
                isDark={isDark}
                hasHeaderShadow={false}
                onClose={handleClose}
                goBack={isMobile ? undefined : handleClose}
                handleEdit={
                  event.sourceType === SOURCE_TYPE.CALDAV ? handleEdit : null
                }
                handleDelete={
                  event.sourceType === SOURCE_TYPE.CALDAV ? deleteEvent : null
                }
                duplicateMultiple={
                  !isTask ? () => openDuplicateModal(event) : undefined
                }
                handleCheckTask={isTask ? () => handleCheckTask() : undefined}
                isTaskChecked={event.status === TASK_STATUS.COMPLETED}
              />
            ) : null}
            <EventDetailTitle
              isNewEvent={false}
              value={event.summary}
              disabled={true}
            />
            <EventDates event={event} isSmall={false} />
            {calendar && calendar?.displayName ? (
              <EventDetailCalendar
                calendar={calendar}
                disabled
                type={event.type}
              />
            ) : null}

            {event.location?.length > 0 ? (
              <EventDetailLocation value={event.location} disabled />
            ) : null}
            {event.description?.length > 0 ? (
              <EventDetailNotes value={event.description} disabled />
            ) : null}

            {event?.attendees?.length ? (
              <EventDetailAttendee
                attendees={event.attendees}
                disabled
                event={event}
                handleClose={handleClose}
              />
            ) : null}
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default EventView;
