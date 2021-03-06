/* tslint:disable:no-magic-numbers */
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CalendarIcon from '@material-ui/icons/DateRange';
import MySwitch from 'components/Switch';
import { ButtonBase } from '@material-ui/core';
import { DateTime } from 'luxon';
import BottomSheet from 'bottom-sheet-react';

import './EventDetail.scss';

import {
  calendarColors,
  HEADER_HEIGHT_SMALL,
} from '../../../components/calendarView/calendar-common';
import {
  useHeight,
  useWidth,
  parseCssDark,
  Input,
  Dropdown,
  ModalSmall,
  DropdownWrapper,
  BottomSheetDropdownSwitcher,
  Modal,
  MyMenu,
} from 'bloben-react';
import AttendeeSettings from '../../../components/attendeeSettings/AttendeeSettings';
import { ReduxState } from '../../../types/types';
import { EvaIcons } from 'bloben-react';
import { Context } from 'bloben-module/context/store';
import LuxonHelper, {
  DATE_MONTH_YEAR_FORMAT,
  DATE_FORMAT,
  WEEK_DAY_FORMAT_MEDIUM,
  TIME_FORMAT,
} from 'bloben-utils/dates/LuxonHelper';
import { MAX_REPEAT_UNTIL_STRING } from 'bloben-utils/models/Event';
import { Calendar, Attendee } from 'bloben-utils';
import { parseToDateTime } from 'bloben-utils/dates/datetimeParser';
import PickerModal from 'components/pickerModal/PickerModal';
import TimezoneRow from 'components/timezoneRow/TimezoneRow';
import AlarmSettings from 'components/alarmSettings/AlarmSettings';
import DatePicker from 'components/datePicker/DatePicker';
import TimeZonePicker from 'components/timezonePicker/TimeZonePicker';
import TimePicker from 'components/timePicker/TimePicker';

const repeatOptions: any = [
  { label: 'No repeat', value: 'none' },
  { label: 'day', value: 'DAILY' },
  { label: 'week', value: 'WEEKLY' },
  { label: 'month', value: 'MONTHLY' },
  { label: 'custom', value: 'custom' },
];

interface TitleProps {
  isNewEvent: boolean;
  value: string;
  handleChange?: any;
  disabled?: boolean;
}
export const Title = (props: TitleProps) => {
  const { isNewEvent, value, handleChange, disabled } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div
      className={parseCssDark(
        `event_detail__row ${disabled ? 'no-row' : ''}`,
        isDark
      )}
    >
      <div className={'event_detail__container--icon'}>
        <CalendarIcon className={'event_detail__icon--hidden'} />
      </div>
      <Input
        placeholder="Add event"
        type="text"
        name="summary"
        autoFocus={isNewEvent}
        multiline={true}
        value={value}
        className={parseCssDark('event_detail__input--big', isDark)}
        onChange={handleChange}
        disabled={disabled}
        isDark={isDark}
      />
    </div>
  );
};

const parseFreqInterval = (freq: string, interval: any): string => {
  switch (freq.toUpperCase()) {
    case 'DAILY':
      return interval && interval > 1 ? `${interval} days` : 'day';
    case 'WEEKLY':
      return interval && interval > 1 ? `${interval} weeks` : 'week';
    case 'MONTHLY':
      return interval && interval > 1 ? `${interval} months` : 'month';
    default:
      return `${interval} ${freq.toLowerCase()}`;
  }
};

const parseRepeatTill = (until: DateTime, count: any): string => {
  if (count) {
    return `for ${count} time${count === 1 ? '' : 's'}`;
  }

  return `until ${until.toFormat(DATE_MONTH_YEAR_FORMAT)}`;
};

/**
 * Parse rRule object to readable format
 * @param rRule
 */
const parseRRuleText = (rRule: any) => {
  const { freq, interval, until, count } = rRule;

  const isInfinite = !(
    (until && LuxonHelper.isBefore(until, MAX_REPEAT_UNTIL_STRING)) ||
    count
  );

  return `
  Repeat every ${parseFreqInterval(freq, interval)} ${
    isInfinite ? '' : parseRepeatTill(until, count)
  }
  `;
};

interface CalendarRow {
  calendar: Calendar;
  selectCalendar?: any;
  disabled?: boolean;
}
export const CalendarRow = (props: CalendarRow) => {
  const { calendar, disabled, selectCalendar } = props;

  const [isOpen, openMenu] = useState(false);

  const calendars: Calendar[] = useSelector(
    (state: ReduxState) => state.calendars
  );

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const handleMenuOpen = (e: any) => {
    if (!isOpen) {
      openMenu(true);
    }
  };
  const handleMenuClose = () => {
    openMenu(false);
  };
  const selectOption = (item: Calendar) => {
    if (selectCalendar) {
      selectCalendar(item);
    }
    handleMenuClose();
  };

  return (
    <div
      className={parseCssDark(
        `event_detail__row ${disabled ? 'no-row' : ''}`,
        isDark
      )}
      onClick={!disabled ? handleMenuOpen : undefined}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.CircleFill
          className={'svg-icon calendar-content-svg'}
          fill={calendarColors[calendar.color][isDark ? 'dark' : 'light']}
        />
      </div>
      <div
        className={'event_detail__button'}
        onClick={!disabled ? handleMenuOpen : undefined}
      >
        <p className={parseCssDark('event_detail__input', isDark)}>
          {calendar.name}
        </p>
      </div>
      {isOpen ? (
        !isMobile ? (
          <Dropdown
            isDark={isDark}
            isOpen={isOpen}
            handleClose={handleMenuClose}
            values={
              <MyMenu
                isDark={isDark}
                variant="calendar"
                select={selectOption}
                selected={calendar}
                handleClose={handleMenuClose}
                data={calendars}
              />
            }
            onClick={selectOption}
            type={'children'}
          />
        ) : (
          <ModalSmall
            isOpen={isOpen}
            handleClose={handleMenuClose}
            isDark={isDark}
          >
            <MyMenu
              isDark={isDark}
              variant="calendar"
              select={selectOption}
              selected={calendar}
              handleClose={handleMenuClose}
              data={calendars}
            />
          </ModalSmall>
        )
      ) : null}
    </div>
  );
};

interface DateFromProps {
  openDateFrom: any;
  openTimeFrom: any;
  isStartDateValid?: boolean;
  startDate: string;
  allDay: boolean;
  timezoneStart: string;
}
const DateFrom = (props: DateFromProps) => {
  const {
    isStartDateValid,
    openDateFrom,
    startDate,
    allDay,
    openTimeFrom,
    timezoneStart,
  } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'event_detail__row no-row'}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Calendar className={'svg-icon event-content-svg'} />
      </div>
      <div className={'event_detail__sub-row'}>
        <ButtonBase className={'event_detail__button'} onClick={openDateFrom}>
          <p
            className={`${parseCssDark('event_detail__input', isDark)} ${
              !isStartDateValid ? 'date-error' : ''
            }`}
          >
            {parseToDateTime(startDate, timezoneStart).toFormat(DATE_FORMAT)}
          </p>
          <p
            className={`${parseCssDark(
              'event_detail__input-secondary',
              isDark
            )} ${!isStartDateValid ? 'date-error' : ''}`}
          >
            (
            {parseToDateTime(startDate, timezoneStart).toFormat(
              WEEK_DAY_FORMAT_MEDIUM
            )}
            )
          </p>
        </ButtonBase>
        {!allDay ? (
          <ButtonBase
            className={'event_detail__button-right'}
            onClick={openTimeFrom}
          >
            <p
              className={`${parseCssDark('event_detail__input', isDark)} ${
                !isStartDateValid ? 'date-error' : ''
              }`}
            >
              {parseToDateTime(startDate, timezoneStart).toFormat(TIME_FORMAT)}
            </p>
          </ButtonBase>
        ) : null}
      </div>
    </div>
  );
};

interface DateTillProps {
  openDateTill: any;
  openTimeTill: any;
  isStartDateValid?: boolean;
  endDate: string;
  allDay: boolean;
  timezoneStart: string;
}
const DateTill = (props: DateTillProps) => {
  const {
    isStartDateValid,
    openDateTill,
    endDate,
    allDay,
    openTimeTill,
    timezoneStart,
  } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'event_detail__row no-row'}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Calendar className={'svg-icon event-content-svg-hidden'} />
      </div>
      <div className={'event_detail__sub-row'}>
        <ButtonBase className={'event_detail__button'} onClick={openDateTill}>
          <p
            className={`${parseCssDark('event_detail__input', isDark)} ${
              !isStartDateValid ? 'date-error' : ''
            }`}
          >
            {parseToDateTime(endDate, timezoneStart).toFormat(DATE_FORMAT)}
          </p>
          <p
            className={`${parseCssDark(
              'event_detail__input-secondary',
              isDark
            )} ${!isStartDateValid ? 'date-error' : ''}`}
          >
            (
            {parseToDateTime(endDate, timezoneStart).toFormat(
              WEEK_DAY_FORMAT_MEDIUM
            )}
            )
          </p>
        </ButtonBase>
        {!allDay ? (
          <ButtonBase
            className={'event_detail__button-right'}
            onClick={openTimeTill}
          >
            <p
              className={`${parseCssDark('event_detail__input', isDark)} ${
                !isStartDateValid ? 'date-error' : ''
              }`}
            >
              {parseToDateTime(endDate, timezoneStart).toFormat(TIME_FORMAT)}
            </p>
          </ButtonBase>
        ) : null}
      </div>
    </div>
  );
};

interface AllDayProps {
  allDay: boolean;
  setForm: any;
}
const AllDay = (props: AllDayProps) => {
  const { allDay, setForm } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const handleClick = () => {
    allDay ? setForm('allDay', false) : setForm('allDay', true);
  };

  return (
    <div className={parseCssDark('event_detail__row', isDark)}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Calendar className={'svg-icon event-content-svg-hidden'} />
      </div>
      <div className={'event_detail__col--left'}>
        <p className={parseCssDark('event_detail__input', isDark)}>All day</p>
      </div>
      <div className={'event_detail__col--right'}>
        <MySwitch value={allDay} checked={allDay} onValueChange={handleClick} />
      </div>
    </div>
  );
};

interface RepeatValueButtonProps {
  label: string;
  handleClick: any;
  value: any;
  style: any;
}
const RepeatValueButton = (props: RepeatValueButtonProps) => {
  const { label, handleClick, value, style } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={parseCssDark('repeat__value-label', isDark)}>{label}</p>
      <ButtonBase
        className={parseCssDark('repeat__value-container', isDark)}
        style={style}
        onClick={handleClick}
      >
        <p className={parseCssDark('repeat__value-text', isDark)}>{value}</p>
      </ButtonBase>
    </div>
  );
};
interface RepeatValueDropdownProps {
  isOpen: any;
  label: string;
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
        className={parseCssDark('repeat__value-container', isDark)}
        style={style}
        onClick={handleOpen}
      >
        <p className={parseCssDark('repeat__value-text', isDark)}>{value}</p>
      </ButtonBase>
      <Dropdown
        isDark={isDark}
        isOpen={isOpen}
        handleClose={handleClose}
        selectedValue={value}
        values={values}
        onClick={handleSelect}
        variant={'simple'}
        className={'dropdown__align-bottom'}
      />
    </div>
  );
};

interface RepeatValueInputProps {
  defaultValue?: any;
  label: string;
  type: string;
  name: any;
  onChange: any;
  style: any;
  value: any;
}
export const RepeatValueInput = (props: RepeatValueInputProps) => {
  const { label, defaultValue, type, name, value, onChange, style } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={'repeat__value-label'}>{label}</p>
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

interface RepeatOptionsProps {
  rRuleState: any;
  setRRule: any;
  handleClose: any;
}
const RepeatOptions = (props: RepeatOptionsProps) => {
  const { rRuleState, setRRule, handleClose } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const { freq, interval, until, count } = rRuleState;

  const DEFAULT_FREQ_OPEN_VALUE: any = { clientX: null };

  const [freqIsOpen, openFreq] = useState(DEFAULT_FREQ_OPEN_VALUE);
  const [untilIsOpen, openUntil] = useState(false);
  const [repeatTillValue, setRepeatTillValue] = useState('forever');
  const [isDateTillVisible, openDateTill] = useState(false);

  useEffect(() => {
    if (rRuleState.freq === 'none') {
      setRRule('freq', 'weekly');
      setRRule('interval', 1);
    }
  }, []);

  const selectFreq = (value: any) => {
    setRRule('freq', value);
    if (value === 'none') {
      setRRule('interval', '');
      setRRule('until', null);
      setRRule('count', null);
    } else {
      if (value === 'count') {
        setRRule('count', 7);
      }
      if (!interval) {
        setRRule('interval', 1);
      }
    }
    openFreq(DEFAULT_FREQ_OPEN_VALUE);
  };
  const selectUntil = (value: any) => {
    if (value === 'date') {
      setRRule('count', null);
      // TODO default date until
      setRRule('until', DateTime.local().plus({ years: 1 }));
      setRepeatTillValue('date');
    } else if (value === 'count') {
      setRRule('count', 7);
      setRRule('until', null);
      setRepeatTillValue('count');
    } else {
      setRRule('count', null);
      setRRule('until', null);
      setRepeatTillValue('forever');
    }
    openUntil(false);
  };

  const handleOpenRepeatUntil = (e: any) => {
    openUntil(e.nativeEvent);
  };

  const handleChange = (event: any) => {
    const target: any = event.target;
    const name: any = target.name;
    setRRule(name, event.target.value);
  };

  const selectDateUntil = (value: any) => {
    setRRule('until', value.toString());
  };

  const handleSave = (): void => {
    handleClose();
  };

  const openFreqDropdown = (e: any) => {
    const nativeEvent: any = e.nativeEvent;
    const { clientX, clientY } = nativeEvent;
    openFreq({ clientX, clientY });
  };

  const freqValues = ['none', 'daily', 'weekly', 'monthly'];
  const untilValues = ['forever', 'date', 'count'];

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
          <h4 className={parseCssDark('repeat__subtitle', isDark)}>Repeat</h4>
        </div>
        <div
          style={{ display: 'flex', width: '50%', justifyContent: 'flex-end' }}
        >
          <ButtonBase
            title={'Save'}
            className={'button__container-small'}
            onClick={handleSave}
          />
        </div>
      </div>
      <div className={'repeat__row'}>
        <RepeatValueDropDown
          label={'Frequency'}
          value={freq}
          style={{ width: 80 }}
          handleOpen={openFreqDropdown}
          handleClose={() => openFreq(DEFAULT_FREQ_OPEN_VALUE)}
          values={freqValues}
          handleSelect={selectFreq}
          isOpen={freqIsOpen.clientX ? true : null}
        />
        <div style={{ width: 25 }} />
        {freq !== 'none' ? (
          <RepeatValueInput
            style={{ width: 45 }}
            type={'number'}
            label={'Interval'}
            name={'interval'}
            value={interval}
            onChange={handleChange}
          />
        ) : null}
      </div>
      {freq !== 'none' ? (
        <h4 className={parseCssDark('repeat__subtitle', isDark)}>
          Repeat until
        </h4>
      ) : null}
      <div className={'repeat__row'}>
        {freq !== 'none' ? (
          <RepeatValueDropDown
            label={'Until'}
            value={repeatTillValue}
            style={{ width: 80 }}
            handleOpen={handleOpenRepeatUntil}
            handleClose={() => openUntil(false)}
            values={untilValues}
            handleSelect={selectUntil}
            isOpen={untilIsOpen}
          />
        ) : null}
        <div style={{ width: 25 }} />
        {freq !== 'none' && repeatTillValue === 'count' ? (
          <RepeatValueInput
            style={{ width: 45 }}
            type={'number'}
            label={'Count'}
            name={'count'}
            value={count}
            onChange={handleChange}
          />
        ) : null}
        {freq !== 'none' && repeatTillValue === 'date' ? (
          <RepeatValueButton
            style={{ width: 100 }}
            label={'Date'}
            value={DateTime.fromISO(until).toFormat('dd.MM.yyyy')}
            handleClick={() => openDateTill(true)}
          />
        ) : null}
        {isDateTillVisible ? (
          <PickerModal
            dateOnly={true}
            selectedDate={until}
            selectDate={selectDateUntil}
            handleCloseModal={() => openDateTill(false)}
          />
        ) : null}
      </div>
    </div>
  );
};

interface RepeatProps {
  setForm: any;
  isRepeated: boolean;
  setRRule: any;
  rRuleState: any;
  coordinates: any;
  setCoordinates: any;
}
const Repeat = (props: RepeatProps) => {
  const {
    setForm,
    isRepeated,
    setRRule,
    rRuleState,
    coordinates,
    setCoordinates,
  } = props;

  const [anchor, setAnchor] = useState(null);
  const [isOpen, openMenu] = useState(false);
  const [isCustomOpen, openCustomMenu] = useState(false);

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const height: number = useHeight();
  const handleMenuOpen = (e: any) => {
    if (!isOpen) {
      setAnchor(e.currentTarget);
      openMenu(true);
    }
  };
  const handleMenuClose = () => {
    openMenu(false);
    setAnchor(null);
  };

  const selectOption = (item: any) => {
    if (item.value === 'custom') {
      openCustomMenu(true);
      setForm('isRepeated', true);
      handleMenuClose();

      return;
    }
    if (item.value === 'none') {
      setForm('isRepeated', false);
      setRRule('reset');

      return;
    }
    setForm('isRepeated', true);
    setRRule('reset');
    // TODO testing repeat
    setRRule('freq', item.value);
    handleMenuClose();
  };

  return (
    <div
      className={parseCssDark('event_detail__row', isDark)}
      onClick={handleMenuOpen}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Refresh className={'svg-icon event-content-svg'} />
      </div>
      <div className={'event_detail__button'}>
        <p className={parseCssDark('event_detail__input', isDark)}>
          {isRepeated ? parseRRuleText(rRuleState) : 'No repeat'}
        </p>
      </div>
      {isOpen ? (
        isMobile ? (
          <ModalSmall
            isOpen={isOpen}
            handleClose={handleMenuClose}
            isDark={isDark}
          >
            <MyMenu
              isDark={isDark}
              variant="radio"
              select={selectOption}
              selected={{ label: isRepeated, value: isRepeated }}
              handleClose={handleMenuClose}
              data={repeatOptions}
            />
          </ModalSmall>
        ) : (
          <DropdownWrapper
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            handleClose={handleMenuClose}
          >
            <MyMenu
              isDark={isDark}
              variant="radio"
              select={selectOption}
              selected={{ label: isRepeated, value: isRepeated }}
              handleClose={handleMenuClose}
              data={repeatOptions}
            />
          </DropdownWrapper>
        )
      ) : null}
      {isCustomOpen ? (
        <BottomSheet
          {...props}
          backdropClassName={isDark ? 'bottom-sheet__backdrop--dark' : ''}
          containerClassName={isDark ? 'bottom-sheet__container--dark' : ''}
          customHeight={(height / 4) * 2}
          isExpandable={false}
          onClose={() => openCustomMenu(false)}
        >
          <RepeatOptions
            setRRule={setRRule}
            rRuleState={rRuleState}
            handleClose={() => openCustomMenu(false)}
          />
        </BottomSheet>
      ) : null}
    </div>
  );
};

interface LocationProps {
  handleChange: any;
  value: string;
}
const Location = (props: LocationProps) => {
  const { handleChange, value } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={parseCssDark('event_detail__row', isDark)}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Pin className={'svg-icon event-content-svg'} />
      </div>
      <Input
        type="text"
        name="location"
        placeholder="Add location"
        autoComplete={'off'}
        className={parseCssDark('event_detail__input', isDark)}
        onChange={handleChange}
        value={value}
        multiline={true}
        isDark={isDark}
      />
    </div>
  );
};

interface NotesProps {
  handleChange: any;
  value: string;
}
const Notes = (props: NotesProps) => {
  const { handleChange, value } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={parseCssDark('event_detail__row', isDark)}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Note className={'svg-icon event-content-svg'} />
      </div>
      <Input
        type="text"
        name="description"
        placeholder="Add notes"
        autoComplete={'off'}
        className={parseCssDark('event_detail__input', isDark)}
        onChange={handleChange}
        value={value}
        multiline={true}
        isDark={isDark}
      />
    </div>
  );
};

interface EventDetailProps {
  summary: string;
  handleChange: any;
  calendar: Calendar;
  location: string;
  startDate: string;
  endDate: string;
  isRepeated: boolean;
  isStartDateValid?: any;
  description: string;
  allDay: boolean;
  setForm: any;
  setRRule: any;
  rRuleState: any;
  alarms: any;
  addAlarm: any;
  removeAlarm: any;
  isNewEvent: boolean;
  handleScroll: any;
  handleChangeDateFrom: any;
  handleChangeDateTill: any;
  timezoneStart: string;
  setStartTimezone: any;
  selectCalendar: any;
  organizer: Attendee;
  attendees: Attendee[];
  addAttendee: any;
  removeAttendee: any;
  makeOptional: any;
}
const EventDetail = (props: EventDetailProps) => {
  const [isDateFromVisible, openDateFrom] = useState(false);
  const [isTimeFromVisible, openTimeFrom] = useState(false);
  const [isDateTillVisible, openDateTill] = useState(false);
  const [isTimeTillVisible, openTimeTill] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: null, y: null });
  const [timezoneModalIsOpen, openTimezoneModal] = useState(false);

  const height: any = useHeight();
  const width: number = useWidth();

  const [store] = useContext(Context);
  const { isMobile, isDark } = store;

  const {
    summary,
    handleChange,
    calendar,
    location,
    startDate,
    endDate,
    isRepeated,
    isStartDateValid,
    description,
    allDay,
    setForm,
    setRRule,
    rRuleState,
    alarms,
    addAlarm,
    removeAlarm,
    isNewEvent,
    handleScroll,
    handleChangeDateFrom,
    handleChangeDateTill,
    timezoneStart,
    setStartTimezone,
    selectCalendar,
    attendees,
    addAttendee,
    removeAttendee,
    makeOptional,
    organizer,
  } = props;

  /**
   * Click listener to set coordinates for dropdowns
   * @param e
   */
  const handleNewCoordinates = (e: any) => {
    const rect: any = e.target.getBoundingClientRect();
    setCoordinates({ x: rect.x, y: rect.y });
  };

  useEffect(() => {
    document.addEventListener('click', handleNewCoordinates);

    return () => {
      document.removeEventListener('click', handleNewCoordinates);
    };
  }, []);

  const wrapperStyle: any = {
    height: isMobile ? height - HEADER_HEIGHT_SMALL : height / 2,
  };

  const closePickers = (): void => {
    openDateFrom(false);
    openDateTill(false);
    openTimeFrom(false);
    openTimeTill(false);
  };

  return (
    <div
      className={'event_detail__wrapper'}
      id={'event_detail__wrapper'}
      style={wrapperStyle}
      onScroll={handleScroll}
    >
      <Title
        value={summary}
        handleChange={handleChange}
        isNewEvent={isNewEvent}
      />
      <CalendarRow calendar={calendar} selectCalendar={selectCalendar} />
      <DateFrom
        startDate={startDate}
        allDay={allDay}
        openDateFrom={() => {
          openDateFrom(true);
        }}
        openTimeFrom={() => {
          openTimeFrom(true);
        }}
        isStartDateValid={isStartDateValid}
        timezoneStart={timezoneStart}
      />
      <DateTill
        endDate={endDate}
        allDay={allDay}
        openDateTill={() => {
          openDateTill(true);
        }}
        openTimeTill={() => {
          openTimeTill(true);
        }}
        timezoneStart={timezoneStart}
      />
      <AllDay allDay={allDay} setForm={setForm} />
      {!allDay ? (
        <TimezoneRow
          timezone={timezoneStart}
          openTimezoneModal={() => openTimezoneModal(true)}
        />
      ) : null}
      <Repeat
        setForm={setForm}
        isRepeated={isRepeated}
        rRuleState={rRuleState}
        setRRule={setRRule}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <AttendeeSettings
        organizer={organizer}
        attendees={attendees}
        addAttendee={addAttendee}
        removeAttendee={removeAttendee}
        makeOptional={makeOptional}
        isEditable={true}
      />
      <AlarmSettings
        alarms={alarms}
        addAlarm={addAlarm}
        removeAlarm={removeAlarm}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <Location handleChange={handleChange} value={location} />
      <Notes handleChange={handleChange} value={description} />
      {isMobile ? <div className={'empty__space'} /> : null}

      {isDateFromVisible ||
      isTimeFromVisible ||
      isDateTillVisible ||
      isTimeTillVisible ? (
        <BottomSheetDropdownSwitcher
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          handleClose={closePickers}
          dropdownOffset={'bottom'}
          isMobile={isMobile}
          isDark={isDark}
        >
          {isDateFromVisible && startDate ? (
            <DatePicker
              keyPrefix={'dateFrom'}
              width={isMobile ? width - 48 : 250}
              sideMargin={24}
              height={(height / 6) * 3}
              selectDate={props.handleChangeDateFrom}
              selectedDate={startDate}
            />
          ) : null}
          {isTimeFromVisible && startDate ? (
            <TimePicker
              width={isMobile ? width - 48 : 60}
              selectTime={handleChangeDateFrom}
              selectedDate={startDate}
              timezone={timezoneStart}
            />
          ) : null}
          {isDateTillVisible ? (
            <DatePicker
              keyPrefix={'dateTill'}
              width={isMobile ? width - 48 : 250}
              sideMargin={24}
              height={(height / 6) * 2}
              selectDate={handleChangeDateTill}
              selectedDate={endDate}
            />
          ) : null}
          {isTimeTillVisible ? (
            <TimePicker
              width={isMobile ? width - 48 : 60}
              selectTime={handleChangeDateTill}
              selectedDate={endDate}
              timezone={timezoneStart}
            />
          ) : null}
        </BottomSheetDropdownSwitcher>
      ) : null}
      {timezoneModalIsOpen ? (
        <Modal isDark={isDark}>
          <TimeZonePicker
            selectTimezone={setStartTimezone}
            onClose={() => openTimezoneModal(false)}
          />
        </Modal>
      ) : null}
    </div>
  );
};

export default EventDetail;
