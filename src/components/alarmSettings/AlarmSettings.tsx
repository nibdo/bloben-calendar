import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';

import './AlarmSettings.scss';
import { ButtonBase, IconButton } from '@material-ui/core';
import BottomSheet from 'bottom-sheet-react';
import {
  EvaIcons,
  useHeight,
  parseCssDark,
  Dropdown,
  DropdownWrapper,
  ModalSmall,
  MyMenu,
} from 'bloben-react';
import { Context } from 'bloben-module/context/store';
import { ICalendarSettings } from 'types/types';

const ALARMS_MAX_LENGTH = 4;

const alarmSettings: any = [
  {
    label: 'on start',
    value: {
      alarmType: 'push',
      amount: 0,
      timeUnit: 'minutes',
    },
  },
  {
    label: '10 minutes before',
    value: {
      alarmType: 'push',
      amount: 10,
      timeUnit: 'minutes',
    },
  },
  {
    label: 'hour before',
    value: {
      alarmType: 'push',
      amount: 1,
      timeUnit: 'hours',
    },
  },
  {
    label: 'day before',
    value: {
      alarmType: 'push',
      amount: 1,
      timeUnit: 'days',
    },
  },
  { label: 'custom', value: 'custom' },
];

interface RepeatValueDropdownProps {
  isOpen: any;
  label?: string;
  handleOpen: any;
  handleClose: any;
  handleSelect: any;
  value: any;
  values: any;
  style: any;
}
export const RepeatValueDropDown = (props: RepeatValueDropdownProps) => {
  const {
    isOpen,
    label,
    handleOpen,
    handleClose,
    handleSelect,
    value,
    values,
    style,
  } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={parseCssDark('repeat__value-label', isDark)}>{label}</p>
      <ButtonBase
        className={'repeat__value-container'}
        style={style}
        onClick={handleOpen}
      >
        <p className={parseCssDark('repeat__value-text', isDark)}>{value}</p>
        <Dropdown
          isOpen={isOpen}
          handleClose={handleClose}
          selectedValue={value}
          values={values}
          onClick={handleSelect}
          variant={'simple'}
          isDark={isDark}
        />
      </ButtonBase>
    </div>
  );
};

interface RepeatValueInputProps {
  label?: string;
  onChange: any;
  defaultValue?: any;
  type: string;
  name: string;
  value: any;
  style: any;
}
export const RepeatValueInput = (props: RepeatValueInputProps) => {
  const { label, defaultValue, type, name, value, onChange, style } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={parseCssDark('repeat__value-label', isDark)}>{label}</p>
      <input
        type={type}
        style={style}
        defaultValue={defaultValue}
        name={name}
        className={parseCssDark('repeat__value-container', isDark)}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

interface RadioButtonProps {
  isSelected: boolean;
  label: string;
  handleClick: any;
}
const RadioButton = (props: RadioButtonProps) => {
  const { isSelected, label, handleClick } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={parseCssDark('repeat__value-label', isDark)}>{label}</p>
      <IconButton onClick={handleClick}>
        {isSelected ? (
          <EvaIcons.RadioOn
            className={`svg-icon dropdown__icon-selected${
              isDark ? '-dark' : ''
            }`}
          />
        ) : (
          <EvaIcons.RadioOff
            className={`svg-icon dropdown__icon${isDark ? '-dark' : ''}`}
          />
        )}
      </IconButton>
    </div>
  );
};

interface CustomAlarmOptionsProps {
  handleCloseCustomMenu: any;
  addAlarm: any;
}
const CustomAlarmOptions = (props: CustomAlarmOptionsProps) => {
  const { addAlarm, handleCloseCustomMenu } = props;

  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
  );

  const defaultDropdownValue: any = {};

  const [valueIsOpen, openValue] = useState(defaultDropdownValue);
  const [value, setValue] = useState('hours');
  const [amount, setAmount] = useState(2);
  const [type, setType] = useState(calendarSettings.defaultAlarmType);

  const [store] = useContext(Context);

  const { isDark } = store;

  const openDropdown = (e: any) => {
    const nativeEvent: any = e.nativeEvent;
    const { clientX, clientY } = nativeEvent;
    openValue({ clientX, clientY });
  };
  const closeDropdown = () => openValue(defaultDropdownValue);

  const handleChange = (event: any) => {
    setAmount(event.target.value);
  };

  const handleValueSelect = (item: any) => {
    setValue(item);
    openValue(defaultDropdownValue);
  };

  const saveNotification = (): void => {
    addAlarm({
      label: 'custom',
      value: { amount, alarmType: type, timeUnit: value },
    });
    handleCloseCustomMenu();
  };

  const valueOptions = ['minutes', 'hours', 'days', 'weeks'];

  return (
    <div className={'repeat__container'}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '50%', justifyContent: 'flex-end' }}>
          <h4 className={parseCssDark('repeat__subtitle', isDark)}>
            Custom notification
          </h4>
        </div>
        <div
          style={{ display: 'flex', width: '50%', justifyContent: 'flex-end' }}
        >
          <ButtonBase
            className={'button__container-small'}
            onClick={saveNotification}
          >
            Save
          </ButtonBase>
        </div>
      </div>
      <div className={'repeat__row'}>
        <RepeatValueInput
          style={{ width: 45 }}
          type={'number'}
          label={'Amount'}
          name={'amount'}
          value={amount}
          onChange={handleChange}
        />
        <div style={{ width: 25 }} />
        <RepeatValueDropDown
          label={'Frequency'}
          value={value}
          style={{ width: 80 }}
          handleOpen={openDropdown}
          handleClose={closeDropdown}
          values={valueOptions}
          handleSelect={handleValueSelect}
          isOpen={valueIsOpen.clientX ? true : null}
        />
      </div>
      <h4 className={parseCssDark('repeat__subtitle', isDark)}>Notify via</h4>
      <div className={'repeat__row'}>
        <RadioButton
          label={'Push'}
          isSelected={type === 'push'}
          handleClick={() => {
            setType('push');
          }}
        />
        <div style={{ width: 25 }} />
        <RadioButton
          label={'Email'}
          isSelected={type === 'email'}
          handleClick={() => {
            setType('email');
          }}
        />
      </div>
    </div>
  );
};

interface AddAlarmItemProps {
  onClick: any;
}
const AddAlarmItem = (props: AddAlarmItemProps) => {
  const { onClick } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div
      className={`${parseCssDark('event_detail__row', isDark)}  no-row`}
      onClick={onClick}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Bell className={'svg-icon event-content-svg'} />
      </div>
      <div className={'event_detail__button'} onClick={props.onClick}>
        <p className={parseCssDark('event_detail__input', isDark)}>
          Add notification
        </p>
      </div>
    </div>
  );
};

// TODO add custom notification text
const parseAlarmText = (amount: number, timeUnit: string): string => {
  switch (amount) {
    case 0:
      return 'on start';
    case 1:
      return `${timeUnit.slice(0, timeUnit.length - 1)} before`;
    default:
      return `${amount} ${timeUnit} before`;
  }
};

interface OneAlarmProps {
  item: any;
  removeAlarm: any;
}
const OneAlarm = (props: OneAlarmProps) => {
  const { item, removeAlarm } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const notificationText: string = parseAlarmText(item.amount, item.timeUnit);

  return (
    <div className={'event_detail__row no-row'}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Bell className={'svg-icon event-content-svg-hidden'} />
      </div>
      <div className={'event_detail__sub-row'}>
        <div className={'event_detail__button'}>
          <p className={parseCssDark('event_detail__input', isDark)}>
            {`${notificationText}`}
          </p>
        </div>
        <div className={'event_detail__button-right'}>
          <IconButton onClick={() => removeAlarm(item)}>
            <EvaIcons.Cross className={parseCssDark('icon-svg', isDark)} />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

const renderAlarm = (data: any, removeAlarm: any) =>
  data.map((item: any) => (
    <OneAlarm key={item.id} item={item} removeAlarm={removeAlarm} />
  ));

interface AlarmsProps {
  alarms: any;
  removeAlarm: any;
}
const Alarms = (props: AlarmsProps) => {
  const { alarms, removeAlarm } = props;

  return renderAlarm(alarms, removeAlarm);
};

interface AlarmSettingsProps {
  anchor?: any;
  selected?: any;
  alarms: any;
  addAlarm: any;
  removeAlarm: any;
  coordinates: any;
  setCoordinates: any;
}
const AlarmSettings = (props: AlarmSettingsProps) => {
  const {
    selected,
    alarms,
    addAlarm,
    removeAlarm,
    coordinates,
    setCoordinates,
  } = props;

  const height: number = useHeight();
  const [store] = useContext(Context);

  const { isDark, isMobile } = store;

  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
  );

  const [menuIsOpen, openMenu] = useState(false);
  const [isCustomOpen, openCustomMenu] = useState(false);
  const noNewAlarms: boolean = alarms && alarms.length === ALARMS_MAX_LENGTH;

  const alarmSettingsDefault: any =
    calendarSettings.defaultAlarmType !== 'push'
      ? alarmSettings.map((item: any) => {
          if (item.value === 'custom') {
            return item;
          }
          const itemDefault: any = item;

          itemDefault.value.alarmType = calendarSettings.defaultAlarmType;

          return itemDefault;
        })
      : alarmSettings;

  const parseSelectClick = (item: any) => {
    if (item.label === 'custom') {
      openCustomMenu(true);

      return;
    }

    addAlarm(item);
  };

  const handleCloseMenu = (): void => openMenu(false);
  const handleCloseCustomMenu = (): void => openCustomMenu(false);

  return (
    <div
      className={parseCssDark(
        `event_detail__wrapper-row ${!noNewAlarms ? 'no-row' : ''}`,
        isDark
      )}
    >
      {!noNewAlarms ? (
        <AddAlarmItem
          onClick={() => {
            openMenu(true);
          }}
        />
      ) : null}
      {alarms && alarms.length > 0 ? (
        <Alarms alarms={alarms} removeAlarm={removeAlarm} />
      ) : null}
      {menuIsOpen ? (
        !isMobile ? (
          <DropdownWrapper
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            handleClose={handleCloseMenu}
          >
            <MyMenu
              isDark={isDark}
              variant={'radio'}
              select={parseSelectClick}
              selected={selected}
              handleClose={handleCloseMenu}
              data={alarmSettingsDefault}
            />
          </DropdownWrapper>
        ) : (
          <ModalSmall
            isOpen={menuIsOpen}
            handleClose={handleCloseMenu}
            isDark={isDark}
          >
            <MyMenu
              isDark={isDark}
              variant={'radio'}
              select={parseSelectClick}
              selected={selected}
              handleClose={handleCloseMenu}
              data={alarmSettingsDefault}
            />
          </ModalSmall>
        )
      ) : null}

      {isCustomOpen ? (
        <BottomSheet
          {...props}
          backdropClassName={isDark ? 'bottom-sheet__backdrop--dark' : ''}
          containerClassName={isDark ? 'bottom-sheet__container--dark' : ''}
          customHeight={(height / 4) * 2}
          isExpandable={false}
          onClose={handleCloseCustomMenu}
        >
          <CustomAlarmOptions
            addAlarm={addAlarm}
            handleCloseCustomMenu={handleCloseCustomMenu}
          />
        </BottomSheet>
      ) : null}
    </div>
  );
};

export default AlarmSettings;
