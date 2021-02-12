import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';

import './AttendeeSettings.scss';
import { ButtonBase, IconButton } from '@material-ui/core';
import EvaIcons from 'bloben-common/components/eva-icons';
import { HeightHook } from 'bloben-common/utils/layout';
import { parseCssDark } from 'bloben-common/utils/common';
import { ICalendarSettings } from '../../types/types';
import { Context } from 'bloben-package/context/store';
import Modal from '../../bloben-package/components/modal/Modal';
import TimeZonePicker from '../../bloben-package/components/timezonePicker/TimeZonePicker';
import AttendeePicker from './attendeePicker/AttendeePicker';
import Contact from '../../bloben-utils/models/Contact';
import { Attendee, ROLE_OPT } from '../../bloben-package/utils/ICalHelper';

interface IAddAttendeeItemProps {
  onClick: any;
}
const AddAttendee = (props: IAddAttendeeItemProps) => {
  const { onClick } = props;

  const [store] = useContext(Context);

  const {isDark} = store;

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
}
const OneAttendee = (props: IOneAttendeeProps) => {
  const { item, removeAttendee, makeOptional } = props;

  const [store] = useContext(Context);

  const {isDark} = store;

  return (
    <div className={'event_detail__row no-row'}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Bell className={'svg-icon event-content-svg-hidden'} />
      </div>
        <div className={'event_detail__sub-row'}>
        <div className={'event_detail__button-inverted'}>
          <div className={'event_detail__button-row'}>
            <div className={'event_detail__button-right'}>
              <IconButton onClick={() => makeOptional(item)}>
                <EvaIcons.Person className={parseCssDark(`icon-svg ${item.role === ROLE_OPT ? 'role-optional' : ''}`, isDark)} />
              </IconButton>
            </div>
            <div className={'event_detail__button-right'}>
              <IconButton onClick={() => removeAttendee(item)}>
                <EvaIcons.Cross className={parseCssDark('icon-svg', isDark)} />
              </IconButton>
            </div>
          </div>
          <div className={'event_detail__button-col'}>
          <p className={parseCssDark('event_detail__input trunc-text', isDark)}>
            {item.mailto}
          </p>
          <p className={parseCssDark('event_detail__input-small', isDark)}>
            {item.role === ROLE_OPT ? 'OPTIONAL' : ''}
          </p>
          </div>

      </div>

      </div>
    </div>
  );
};

const renderAttendee = (data: any, removeAttendee: any, makeOptional: any) =>
  data.map((item: Attendee) => (
    <OneAttendee
      key={item.mailto}
      item={item}
      removeAttendee={removeAttendee}
      makeOptional={makeOptional}
    />
  ));

interface IAlarmsProps {
  attendees: any;
  removeAttendee: any;
  makeOptional: any;
}
const Attendees = (props: IAlarmsProps) => {
  const { attendees, removeAttendee, makeOptional } = props;

  return renderAttendee(
      attendees,
      removeAttendee,
      makeOptional
  );
};

interface IAttendeeSettingsProps {
  attendees: any;
  addAttendee: any;
  removeAttendee: any;
  makeOptional: any;
}
const AttendeeSettings = (props: IAttendeeSettingsProps) => {
  const {
    attendees,
    addAttendee,
    removeAttendee,
    makeOptional,
  } = props;

  const [store] = useContext(Context);

  const {isDark, isMobile} = store;

  const calendarSettings: ICalendarSettings = useSelector(
      (state: any) => state.calendarSettings
  );

  const [menuIsOpen, openMenu] = useState(false);
  const [pickerIsOpen, openPicker] = useState(false);

  const handleCloseMenu = (): void => openMenu(false);

  const selectItem = (item: any): any => {
    if (!item) {
      console.log(item)
    }

    addAttendee(new Attendee({email: item}))
  }

  return (
    <div className={parseCssDark(`event_detail__wrapper-row ${attendees.length === 0 ? 'no-row' : ''}`, isDark)}>
        <AddAttendee
          onClick={() => {
            openPicker(true);
          }}
        />
      {attendees && attendees.length > 0 ? (
        <Attendees
            attendees={attendees}
            removeAttendee={removeAttendee}
            makeOptional={makeOptional}
        />
      ) : null}
      {pickerIsOpen ? (
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
