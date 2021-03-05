/* tslint:disable:no-magic-numbers */
import React, { useContext, useEffect, useState } from 'react';
import './EventView.scss';
import { useParams } from 'react-router';
import { DateTime } from 'luxon';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  cloneDeep,
  findInArrayById,
  findInEvents,
  formatEventDate,
  handleEventReduxDelete,
} from '../../../utils/common';
import HeaderModal from '../../../bloben-package/components/headerModal/HeaderModal';
import CalendarApi from '../../../api/calendar';
import EvaIcons from '../../../bloben-common/components/eva-icons';
import ICalHelper from '../../../bloben-package/utils/ICalHelper';
import AttendeeSettings, {
  AttendeeActions,
} from '../../../components/attendeeSettings/AttendeeSettings';
import { CalendarRow, Title } from '../eventDetail/EventDetail';
import { parseCssDark } from '../../../bloben-common/utils/common';
import { Context } from '../../../bloben-package/context/store';
import { UserProfile } from '../../../bloben-package/types/common.types';
import EventStateEntity, {
  EventBodyToSend,
} from '../../../bloben-utils/models/event.entity';
import { PgpKeys } from '../../../bloben-utils/utils/OpenPgp';
import { ReduxState } from '../../../types/types';
import { Calendar } from '../../../bloben-utils/models/Calendar';
import { EventDecrypted } from '../../../bloben-utils/models/Event';
import { Attendee, Partstat } from '../../../bloben-utils/models/Attendee';
import {
  createEventEncrypted,
  EventEncrypted,
} from '../../../bloben-utils/models/EventEncrypted';
import User from '../../../bloben-utils/models/User';

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

    const eventModel: any = new EventStateEntity(event);

    const encryptedEvent: EventEncrypted = await createEventEncrypted(
      user.publicKey,
      event
    );

    console.log('bodyyy', encryptedEvent);
    // Update event
    await CalendarApi.updateEvent(encryptedEvent);

    // Send response to organizer
    const icalTest: any = new ICalHelper(
      eventModel.getReduxStateObj()
    ).parseTo();
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
