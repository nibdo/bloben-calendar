/* tslint:disable:no-magic-numbers */
import React, { useContext, useEffect, useState } from 'react';
import './EventView.scss';
import { useParams } from 'react-router';
import { DateTime } from 'luxon';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { parseCssDark, EvaIcons, HeaderModal } from 'bloben-react';

import {
  cloneDeep,
  findInArrayById,
  findInEvents,
  formatEventDate,
  handleEventReduxDelete,
} from '../../../utils/common';
import CalendarApi from '../../../api/calendar';
import AttendeeSettings, {
  AttendeeActions,
} from '../../../components/attendeeSettings/AttendeeSettings';
import { CalendarRow, Title } from '../eventDetail/EventDetail';
import { ReduxState } from '../../../types/types';
import {
  EventDecrypted,
  User,
  Calendar,
  Attendee,
  createEvent,
  EventEncrypted,
  encryptEvent,
  ICalHelper,
} from 'bloben-utils';
import { Context } from 'bloben-module/context/store';
import { UserProfile } from 'bloben-react/types/common.types';
import calendars from 'redux/reducers/calendars';
import { Partstat } from 'bloben-utils/models/Attendee';

interface EventDatesProps {
  event: EventDecrypted;
  isSmall?: boolean;
}
const EventDates = (props: EventDatesProps) => {
  const { event } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const humanDate: any = formatEventDate(event);
  const { dates, time } = humanDate;

  return (
    <div className={parseCssDark('event_detail__row no-row', isDark)}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Calendar className={'svg-icon event-content-svg'} />
      </div>
      <div className={'event_detail__button-col'}>
        <p className={'event_detail__input'}>{dates}</p>
        <p className={'event_detail__input-sub'}>{time}</p>
      </div>
    </div>
  );
};

const EventModel = {
  id: '',
  summary: '',
  calendarId: '',
  organizer: { mailto: '' },
  attendees: [],
};

const EventView = () => {
  const [store, dispatchContext] = useContext(Context);
  const { isDark, isMobile } = store;

  const [event, setEvent] = useState();
  const [calendar, setCalendar] = useState();
  const params: any = useParams();
  const history: any = useHistory();

  const user: User = useSelector((state: ReduxState) => state.user);
  const userProfile: UserProfile = useSelector(
    (state: ReduxState) => state.userProfile
  );
  const calendars: Calendar[] = useSelector(
    (state: ReduxState) => state.calendars
  );

  const isOrganizer: boolean =
    event && event.organizer && event.organizer.mailto === userProfile.appEmail;

  const getCalendar = async (eventItem: EventDecrypted) => {
    if (!eventItem) {
      return;
    }
    const thisCalendar: any = await findInArrayById(
      calendars,
      eventItem.calendarId
    );
    setCalendar(thisCalendar);
  };

  const loadEvent = async (): Promise<void> => {
    // Find event
    const eventItem: EventDecrypted | null = await findInEvents(params.id);

    if (eventItem) {
      await getCalendar(eventItem);
      setEvent(eventItem);
    }
  };

  const handleClose = () => {
    history.goBack();
  };
  const handleEdit = () => {
    history.push(`/event/edit/${event.id}`);
  };

  const changeAttendeeStatus = async (value: string): Promise<void> => {
    let attendeesClone: Attendee[] = cloneDeep(event.attendees);
    attendeesClone = attendeesClone.map((item: Attendee) => {
      if (item.mailto === userProfile.appEmail) {
        item.partstat = value as Partstat;
      }

      return item;
    });

    event.attendees = attendeesClone;

    const eventModel: EventDecrypted = createEvent(event);

    const encryptedEvent: EventEncrypted = await encryptEvent(
      user.publicKey,
      event
    );

    console.log('bodyyy', encryptedEvent);
    // Update event
    await CalendarApi.updateEvent(encryptedEvent);

    // Send response to organizer
    const icalTest: any = new ICalHelper(eventModel).parseTo();
    console.log(icalTest);
    const inviteData: any = {
      attendee: event.attendees
        .filter((item: any) => item.mailto !== userProfile.appEmail)
        .map((item: any) => item.mailto),
      payload: JSON.stringify({
        body: 'Event invite update',
        subject: 'Event invite update',
        attachment: btoa(icalTest),
      }),
    };
    console.log(inviteData);

    await CalendarApi.sendInvite(inviteData);
  };

  const deleteEvent = async (): Promise<void> => {
    if (event) {
      event.deletedAt = DateTime.local().toUTC().toString();

      await CalendarApi.deleteEvent(event);

      await handleEventReduxDelete(event);

      handleClose();
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);
  useEffect(() => {
    loadEvent();
  }, [params.id]);

  return event && event.id ? (
    <div className={'full-screen'}>
      <HeaderModal
        isMobile={isMobile}
        isDark={isDark}
        hasHeaderShadow={false}
        onClose={handleClose}
        handleEdit={isOrganizer ? handleEdit : undefined}
        handleDelete={isOrganizer ? deleteEvent : undefined}
      />

      <Title disabled={true} value={event.summary} isNewEvent={false} />
      <EventDates event={event} isSmall={false} />
      <AttendeeSettings
        organizer={event.organizer}
        attendees={event.attendees}
        isEditable={false}
        changeAttendeeStatus={changeAttendeeStatus}
      />
      {calendar && calendar.name ? (
        <CalendarRow calendar={calendar} disabled />
      ) : null}
      {event.attendees.length > 0 ? <AttendeeActions /> : null}
    </div>
  ) : null;
};

export default EventView;
