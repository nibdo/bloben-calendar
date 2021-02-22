/* tslint:disable:no-magic-numbers */
import React, { useContext, useEffect, useState } from 'react';
import './EventView.scss';
import { useParams } from 'react-router';
import {
  cloneDeep,
  findInArrayById,
  findInEvents,
  formatEventDate,
  handleEventReduxDelete,
} from '../../../utils/common';
import HeaderModal from '../../../bloben-package/components/headerModal/HeaderModal';
import { useHistory } from 'react-router-dom';
import CalendarApi from '../../../api/calendar';
import { DateTime } from 'luxon';
import EvaIcons from '../../../bloben-common/components/eva-icons';
import ICalHelper, { IAttendee } from '../../../bloben-package/utils/ICalHelper';
import AttendeeSettings, {
  AttendeeActions,
} from '../../attendeeSettings/AttendeeSettings';
import { Calendar, Title } from '../eventDetail/EventDetail';
import { parseCssDark } from '../../../bloben-common/utils/common';
import MySwitch from '../../Switch';
import { Context } from '../../../bloben-package/context/store';
import CalendarIcon from '@material-ui/icons/DateRange';
import { IUserProfile } from '../../../bloben-package/types/common.types';
import { useSelector } from 'react-redux';
import EventStateEntity, { EventBodyToSend } from '../../../bloben-utils/models/event.entity';
import { PgpKeys } from '../../../bloben-utils/utils/OpenPgp';

const EventDates = (props: any) => {
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
  const [event, setEvent] = useState(EventModel);
  const [calendar, setCalendar] = useState({ name: null });
  const params: any = useParams();
  const history: any = useHistory();

  const userProfile: IUserProfile = useSelector(
    (state: any) => state.userProfile
  );
  const calendars: any = useSelector((state: any) => state.calendars);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);

  const isOrganizer: boolean = event.organizer.mailto === userProfile.appEmail;

  const getCalendar = async (eventItem: any) => {
    const thisCalendar: any = await findInArrayById(
      calendars,
      eventItem.calendarId
    );
    setCalendar(thisCalendar);
    console.log('thisCalendar,', thisCalendar);
  };

  const loadEvent = async () => {
    // Find event
    const eventItem: any = await findInEvents(params.id);

    const calendar: any = await getCalendar(eventItem);
    setEvent(eventItem);
  };
  const handleClose = () => {
    history.goBack();
  };
  const handleEdit = () => {
    history.push(`/event/edit/${event.id}`);
  };
  const changeAttendeeStatus = async (value: string) => {
    let attendeesClone: any = cloneDeep(event.attendees);
    attendeesClone = attendeesClone.map((item: IAttendee) => {
      if (item.mailto === userProfile.appEmail) {
        item.partstat = value;
      }

      return item;
    })

    event.attendees = attendeesClone;

    const eventModel: any = new EventStateEntity(event);
    const bodyToSend: EventBodyToSend = await eventModel.formatBodyToSendOpenPgp(pgpKeys);

    console.log('bodyyy', bodyToSend)
    // Update event
    await CalendarApi.updateEvent(bodyToSend);

    // Send response to organizer
    const icalTest: any = new ICalHelper(eventModel.getReduxStateObj()).parseTo();
    console.log(icalTest)
    const inviteData: any = {
      attendee: event.attendees.filter((item: any) => item.mailto !== userProfile.appEmail).map((item: any) => item.mailto),
      payload: JSON.stringify({
                                body: 'Event invite update',
                                subject: 'Event invite update',
                                attachment: btoa(icalTest),
                              })
    };
    console.log(inviteData);

    await CalendarApi.sendInvite(inviteData)
  }

  const deleteEvent = async () => {
    if (event) {
      // @ts-ignore
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
      {calendar.name ? <Calendar calendar={calendar} disabled /> : null}
      {event.attendees.length > 0 ? <AttendeeActions /> : null}


    </div>
  ) : null;
};

export default EventView;
