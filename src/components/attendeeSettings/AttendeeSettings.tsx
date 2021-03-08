import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { ButtonBase, IconButton } from '@material-ui/core';
import { EvaIcons, parseCssDark, Dropdown, Modal } from 'bloben-react';

import './AttendeeSettings.scss';

import AttendeePicker from './attendeePicker/AttendeePicker';
import {
  ACCEPTED_ATTENDEE,
  Attendee,
  AttendeeResponse,
  createAttendee,
  DECLINED_ATTENDEE,
  ROLE_OPT,
  TENTATIVE_ATTENDEE,
  WAITING_ATTENDEE,
} from 'bloben-utils/models/Attendee';
import { Context } from 'bloben-module/context/store';
import { UserProfile } from 'bloben-react/types/common.types';

export const AttendeeActions = () => {
  return (
    <div className={'attendee-actions__container'}>
      <div className={'attendee-actions__container-left'}>
        <p className={'attendee-actions__text-info'}>RSVP</p>
      </div>
      <div className={'attendee-actions__container-right'}>
        <p className={'attendee-actions__text-info'}>RSVP</p>
      </div>
    </div>
  );
};

interface AddAttendeeItemProps {
  onClick: any;
}
const AddAttendee = (props: AddAttendeeItemProps) => {
  const { onClick } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div
      className={`${parseCssDark('event_detail__row', isDark)}  no-row`}
      onClick={onClick}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Person className={'svg-icon event-content-svg'} />
      </div>
      <div className={'event_detail__button'} onClick={props.onClick}>
        <p className={parseCssDark('event_detail__input', isDark)}>
          Add people
        </p>
      </div>
    </div>
  );
};

interface OneAttendeeProps {
  item: Attendee;
  removeAttendee: any;
  makeOptional: any;
  organizer: Attendee;
  isEditable: boolean;
}
const OneAttendee = (props: OneAttendeeProps) => {
  const { item, removeAttendee, makeOptional, organizer, isEditable } = props;

  const isOrganizer: boolean = organizer.mailto === item.mailto;
  const attendeeName: string = item.cn || item.mailto;

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div className={'event_detail__row no-row'}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Bell className={'svg-icon event-content-svg-hidden'} />
      </div>
      <div className={'event_detail__sub-row'}>
        <div className={'event_detail__button-inverted'}>
          {isEditable ? (
            <div className={'event_detail__button-row'}>
              <div className={'event_detail__button-right'}>
                <IconButton onClick={() => makeOptional(item)}>
                  <EvaIcons.Person
                    className={parseCssDark(
                      `icon-svg ${
                        item.role === ROLE_OPT ? 'role-optional' : ''
                      }`,
                      isDark
                    )}
                  />
                </IconButton>
              </div>
              <div className={'event_detail__button-right'}>
                <IconButton onClick={() => removeAttendee(item)}>
                  <EvaIcons.Cross
                    className={parseCssDark('icon-svg', isDark)}
                  />
                </IconButton>
              </div>
            </div>
          ) : null}
          <div className={'event_detail__button-col'}>
            <div className={'event_detail__sub-row'}>
              {!isEditable ? (
                <IconButton disabled>
                  {item.partstat === ACCEPTED_ATTENDEE ? (
                    <EvaIcons.CheckCircle
                      className={parseCssDark('icon-svg icon-green', isDark)}
                    />
                  ) : null}
                  {item.partstat === DECLINED_ATTENDEE ? (
                    <EvaIcons.CrossCircle
                      className={parseCssDark('icon-svg icon-red', isDark)}
                    />
                  ) : null}
                  {item.partstat === WAITING_ATTENDEE ||
                  item.partstat === TENTATIVE_ATTENDEE ? (
                    <EvaIcons.QuestionCircle
                      className={parseCssDark('icon-svg', isDark)}
                    />
                  ) : null}
                </IconButton>
              ) : null}
              <div className={'event_detail__button-col'}>
                <p
                  className={parseCssDark(
                    'event_detail__input trunc-text',
                    isDark
                  )}
                >
                  {attendeeName}
                </p>
                <p
                  className={parseCssDark('event_detail__input-small', isDark)}
                >
                  {isOrganizer
                    ? 'Organizer'
                    : item.role === ROLE_OPT
                    ? 'Optional'
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderAttendee = (
  data: Attendee[],
  removeAttendee: any,
  makeOptional: any,
  organizer: Attendee,
  isEditable: boolean
) =>
  data.map((item: any) => {
    if (isEditable) {
      if (item.mailto !== organizer.mailto) {
        return (
          <OneAttendee
            key={item.mailto}
            item={item}
            removeAttendee={removeAttendee}
            makeOptional={makeOptional}
            organizer={organizer}
            isEditable={isEditable}
          />
        );
      }
    } else {
      return (
        <OneAttendee
          key={item.mailto}
          item={item}
          removeAttendee={removeAttendee}
          makeOptional={makeOptional}
          organizer={organizer}
          isEditable={isEditable}
        />
      );
    }
  });

interface AttendeeProps {
  attendees: Attendee[];
  removeAttendee: any;
  makeOptional: any;
  organizer: Attendee;
  isEditable: boolean;
}
const Attendees = (props: AttendeeProps) => {
  const {
    attendees,
    removeAttendee,
    makeOptional,
    organizer,
    isEditable,
  } = props;

  const attendeesRendered: any = renderAttendee(
    attendees,
    removeAttendee,
    makeOptional,
    organizer,
    isEditable
  );

  return <>{attendeesRendered}</>;
};

interface AttendeeStatusProps {
  guestsCount: number;
  waitingGuestsCount?: number;
  changeAttendeeStatus: Function;
  attendeeResponse: AttendeeResponse;
}
const AttendeeStatus = (props: AttendeeStatusProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const attendeeResponseValues: AttendeeResponse[] = [
    ACCEPTED_ATTENDEE,
    TENTATIVE_ATTENDEE,
    DECLINED_ATTENDEE,
  ];

  const {
    guestsCount,
    waitingGuestsCount,
    changeAttendeeStatus,
    attendeeResponse,
  } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const handleAttendeeStatusChange = async (
    newValue: AttendeeResponse
  ): Promise<void> => {
    setIsOpen(false);
    await changeAttendeeStatus(newValue);
  };

  return (
    <div className={`${parseCssDark('event_detail__row', isDark)}  no-row`}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Person className={'svg-icon event-content-svg'} />
      </div>
      <div className={'event_detail__col--left'}>
        <p className={'event_detail__input'}>{`${guestsCount} guests`}</p>
        <p className={'event_detail__input-sub'}>
          {waitingGuestsCount ? `${waitingGuestsCount} waiting` : ''}
        </p>
      </div>
      <div className={'event_detail__col--right'}>
        <ButtonBase
          className={'event_detail__button'}
          onClick={() => setIsOpen(true)}
        >
          <p className={'event_detail__input'}>{attendeeResponse}</p>
          <Dropdown
            isOpen={isOpen}
            handleClose={() => setIsOpen(false)}
            selectedValue={attendeeResponse}
            values={attendeeResponseValues}
            onClick={handleAttendeeStatusChange}
            variant={'simple'}
            isDark={isDark}
          />
        </ButtonBase>
      </div>
    </div>
  );
};

interface AttendeeSettingsProps {
  attendees: Attendee[];
  addAttendee?: Function;
  removeAttendee?: Function;
  makeOptional?: Function;
  organizer: Attendee;
  isEditable: boolean;
  changeAttendeeStatus?: Function;
}
const AttendeeSettings = (props: AttendeeSettingsProps) => {
  const {
    attendees,
    addAttendee,
    removeAttendee,
    makeOptional,
    isEditable,
    organizer,
    changeAttendeeStatus,
  } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const userProfile: UserProfile = useSelector(
    (state: any) => state.userProfile
  );

  const [menuIsOpen, openMenu] = useState(false);
  const [pickerIsOpen, openPicker] = useState(false);

  const handleCloseMenu = (): void => openMenu(false);

  const selectItem = (item: any): void => {
    if (!item) {
      console.log(item);
    }

    if (addAttendee) {
      addAttendee(createAttendee({ email: item }));
    }
  };

  const attendeeResponse: AttendeeResponse = attendees.filter(
    (item: Attendee) => item.mailto === userProfile.appEmail
  )[0].partstat;

  const guestsCount: number = attendees.length;
  const waitingGuestsCount: number = attendees.filter(
    (item: Attendee) => item.partstat === WAITING_ATTENDEE
  ).length;

  return (
    <div
      className={parseCssDark(
        `event_detail__wrapper-row ${
          attendees.length === 0 || !isEditable ? 'no-row' : ''
        }`,
        isDark
      )}
    >
      {isEditable ? (
        <AddAttendee
          onClick={() => {
            openPicker(true);
          }}
        />
      ) : null}
      {!isEditable && changeAttendeeStatus ? (
        <AttendeeStatus
          guestsCount={guestsCount}
          waitingGuestsCount={waitingGuestsCount}
          changeAttendeeStatus={changeAttendeeStatus}
          attendeeResponse={attendeeResponse}
        />
      ) : null}
      {attendees && attendees.length > 0 ? (
        <Attendees
          attendees={attendees}
          removeAttendee={removeAttendee}
          makeOptional={makeOptional}
          organizer={organizer}
          isEditable={isEditable}
        />
      ) : null}
      {pickerIsOpen && isEditable ? (
        <Modal isDark={isDark}>
          <AttendeePicker
            onClose={() => openPicker(false)}
            handleSelect={selectItem}
            attendees={attendees}
            makeOptional={makeOptional}
          />
        </Modal>
      ) : null}
    </div>
  );
};

export default AttendeeSettings;
