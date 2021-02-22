import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';

import './AttendeeSettings.scss';
import { Button, ButtonBase, IconButton } from '@material-ui/core';
import EvaIcons from 'bloben-common/components/eva-icons';
import { HeightHook } from 'bloben-common/utils/layout';
import { parseCssDark } from 'bloben-common/utils/common';
import { ICalendarSettings } from '../../types/types';
import { Context } from 'bloben-package/context/store';
import Modal from '../../bloben-package/components/modal/Modal';
import TimeZonePicker from '../../bloben-package/components/timezonePicker/TimeZonePicker';
import AttendeePicker from './attendeePicker/AttendeePicker';
import Contact from '../../bloben-utils/models/Contact';
import {
  Attendee,
  IAttendee,
  ROLE_OPT,
} from '../../bloben-package/utils/ICalHelper';
import { IUserProfile } from '../../bloben-package/types/common.types';
import Dropdown from '../../bloben-package/components/dropdown/Dropdown';

const WAITING_ATTENDEE: string = 'NEEDS-ACTION';
const ACCEPTED_ATTENDEE: string = 'ACCEPTED';
const DECLINED_ATTENDEE: string = 'DECLINED';
const TENTATIVE_ATTENDEE: string = 'TENTATIVE';

export const AttendeeActions = (props: any) => {

  return <div className={'attendee-actions__container'}>
  <div className={'attendee-actions__container-left'}>
    <p className={'attendee-actions__text-info'}>RSVP</p>
  </div>
    <div className={'attendee-actions__container-right'}>
      <p className={'attendee-actions__text-info'}>RSVP</p>
    </div>
  </div>
}

interface IAddAttendeeItemProps {
  onClick: any;
}
const AddAttendee = (props: IAddAttendeeItemProps) => {
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

interface IOneAttendeeProps {
  item: Attendee;
  removeAttendee: any;
  makeOptional: any;
  organizer: any;
  isEditable: boolean;
}
const OneAttendee = (props: IOneAttendeeProps) => {
  const { item, removeAttendee, makeOptional, organizer, isEditable } = props;

  const isOrganizer: boolean = organizer.mailto === item.mailto;

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
                  {!isEditable ?
                          <IconButton disabled>
                {item.partstat === ACCEPTED_ATTENDEE
                    ? <EvaIcons.CheckCircle className={parseCssDark('icon-svg icon-green', isDark)}
                    />
                    : null
                }
                {item.partstat === DECLINED_ATTENDEE
                    ? <EvaIcons.CrossCircle className={parseCssDark('icon-svg icon-red', isDark)}
                    />
                    : null
                }
                {item.partstat === WAITING_ATTENDEE || item.partstat === TENTATIVE_ATTENDEE
                    ? <EvaIcons.QuestionCircle className={parseCssDark('icon-svg', isDark)}
                    />
                    : null
                }
              </IconButton>
                      : null }
              <div className={'event_detail__button-col'}>
              <p
              className={parseCssDark('event_detail__input trunc-text', isDark)}
            >
              {item.mailto}
            </p>
            <p className={parseCssDark('event_detail__input-small', isDark)}>
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
  data: any,
  removeAttendee: any,
  makeOptional: any,
  organizer: any,
  isEditable: boolean
) =>
  data.map((item: Attendee) => {
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

interface IAlarmsProps {
  attendees: any;
  removeAttendee: any;
  makeOptional: any;
  organizer: any;
  isEditable: boolean;
}
const Attendees = (props: IAlarmsProps) => {
  const {
    attendees,
    removeAttendee,
    makeOptional,
    organizer,
    isEditable,
  } = props;
  const userProfile: IUserProfile = useSelector(
    (state: any) => state.userProfile
  );

  return renderAttendee(
    attendees,
    removeAttendee,
    makeOptional,
    organizer,
    isEditable
  );
};


interface IAttendeeStatusProps {
  guestsCount: number;
  waitingGuestsCount?: number;
  changeAttendeeStatus: any;
  rsvpStatus: string;
}
const AttendeeStatus = (props: IAttendeeStatusProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rsvpValues: any =
    [ACCEPTED_ATTENDEE, TENTATIVE_ATTENDEE, DECLINED_ATTENDEE]

  const { guestsCount, waitingGuestsCount, changeAttendeeStatus, rsvpStatus } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const handleAttendeeStatusChange = async (newValue: string) => {
    setIsOpen(false);
    await changeAttendeeStatus(newValue)
  }

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
        <ButtonBase className={'event_detail__button'} onClick={() => setIsOpen(true)}>
          <p className={'event_detail__input'}>{rsvpStatus}</p>
          <Dropdown
              isOpen={isOpen}
              handleClose={() => setIsOpen(false)}
              selectedValue={rsvpStatus}
              values={rsvpValues}
              onClick={handleAttendeeStatusChange}
              variant={'simple'}
          />
        </ButtonBase>
      </div>
    </div>
  );
};

interface IAttendeeSettingsProps {
  attendees: any;
  addAttendee?: any;
  removeAttendee?: any;
  makeOptional?: any;
  organizer: any;
  isEditable: boolean;
  changeAttendeeStatus?: any;
}
const AttendeeSettings = (props: IAttendeeSettingsProps) => {
  const {
    attendees,
    addAttendee,
    removeAttendee,
    makeOptional,
    isEditable,
    organizer,
    changeAttendeeStatus
  } = props;

  const [store] = useContext(Context);

  const { isDark, isMobile } = store;

  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
  );
  const userProfile: IUserProfile = useSelector(
      (state: any) => state.userProfile
  );


  const [menuIsOpen, openMenu] = useState(false);
  const [pickerIsOpen, openPicker] = useState(false);

  const handleCloseMenu = (): void => openMenu(false);

  const selectItem = (item: any): any => {
    if (!item) {
      console.log(item);
    }

    addAttendee(new Attendee({ email: item }));
  };

  const rsvpStatus: string = attendees.filter((item: IAttendee) => item.mailto === userProfile.appEmail)[0].partstat
  const guestsCount: number = attendees.length;
  const waitingGuestsCount: number = attendees.filter(
    (item: IAttendee) => item.partstat === WAITING_ATTENDEE
  ).length;

  return (
    <div
      className={parseCssDark(
        `event_detail__wrapper-row ${attendees.length === 0 || !isEditable ? 'no-row' : ''}`,
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
      {!isEditable ? (
        <AttendeeStatus
          guestsCount={guestsCount}
          waitingGuestsCount={waitingGuestsCount}
          changeAttendeeStatus={changeAttendeeStatus}
          rsvpStatus={rsvpStatus}
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
        <Modal>
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
