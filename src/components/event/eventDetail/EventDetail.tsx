/* tslint:disable:no-magic-numbers */
import React, { useContext, useEffect, useState } from 'react';
import './EventDetail.scss';

import { Input } from 'bloben-package/components/input/Input';
import CalendarIcon from '@material-ui/icons/DateRange';
import MySwitch from 'components/Switch';

import PickerModal from '../../../bloben-package/components/pickerModal/PickerModal';
import { HeightHook, WidthHook } from '../../../bloben-common/utils/layout';
import { addYears, format, isBefore } from 'date-fns';
import Dropdown from '../../../bloben-package/components/dropdown/Dropdown';
import { ButtonBase } from '@material-ui/core';
import {
  calendarColors,
  HEADER_HEIGHT_SMALL,
} from '../../calendarView/calendar-common';
import DatePicker from '../../../bloben-package/components/datePicker/DatePicker';
import TimePicker from '../../../bloben-package/components/timePicker/TimePicker';
import {
  DATE_FORMAT,
  DATE_MONTH_YEAR_FORMAT,
  formatDate,
  TIME_FORMAT,
  WEEK_DAY_FORMAT_SHORT,
} from '../../../bloben-package/utils/date';
import EvaIcons from '../../../bloben-common/components/eva-icons';
import { useSelector } from 'react-redux';
import NotificationSettings from '../../../bloben-package/components/notificationSettings/NotificationSettings';
import { MAX_REPEAT_UNTIL } from '../../../data/entities/state/event.entity';
import DropdownWrapper from '../../../bloben-package/components/dropdownWrapper/DropdownWrapper';
import BottomSheetDropdownSwitcher from '../../../bloben-package/components/bottomSheetDropdownSwitcher/BottomSheetDropdownSwitcher';
import ModalSmall from '../../../bloben-package/components/modalSmall/ModalSmall';
import { parseCssDark } from '../../../bloben-common/utils/common';
import BottomSheet from 'bottom-sheet-react';
import { Context } from '../../../bloben-package/context/store';
import MyMenu from '../../../bloben-package/components/myMenu/MyMenu';

const repeatOptions: any = [
  { label: 'No repeat', value: 'none' },
  { label: 'day', value: 'DAILY' },
  { label: 'week', value: 'WEEKLY' },
  { label: 'month', value: 'MONTHLY' },
  { label: 'custom', value: 'custom' },
];

interface ITitleProps {
  isNewEvent: boolean;
  value: string;
  handleChange: any;
}
const Title = (props: ITitleProps) => {
  const { isNewEvent, value, handleChange } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={parseCssDark('event_detail__row', isDark)}>
      <div className={'event_detail__container--icon'}>
        <CalendarIcon className={'event_detail__icon--hidden'} />
      </div>
      <Input
        placeholder="Add event"
        type="text"
        name="text"
        autoFocus={isNewEvent}
        multiline={true}
        value={value}
        className={parseCssDark('event_detail__input--big', isDark)}
        onChange={handleChange}
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

const parseRepeatTill = (until: Date, count: any): string => {
  if (count) {
    return `for ${count} time${count === 1 ? '' : 's'}`;
  }

  return `until ${formatDate(until, DATE_MONTH_YEAR_FORMAT)}`;
};

/**
 * Parse rRule object to readable format
 * @param rRule
 */
const parseRRuleText = (rRule: any) => {
  const { freq, interval, until, count } = rRule;

  const isInfinite: boolean = !(
    (until && isBefore(until, MAX_REPEAT_UNTIL)) ||
    count
  );

  return `
  Repeat every ${parseFreqInterval(freq, interval)} ${
    isInfinite ? '' : parseRepeatTill(until, count)
  }
  `;
};

interface ICalendarProps {
  setForm: any;
  calendar: any;
  coordinates: any;
  setCoordinates: any;
}
export const Calendar = (props: ICalendarProps) => {
  const { setForm, calendar, coordinates, setCoordinates } = props;

  const [anchor, setAnchor] = useState(null);
  const [isOpen, openMenu] = useState(false);

  const calendars: any = useSelector((state: any) => state.calendars);

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

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
    setForm('calendarId', item.id);
    handleMenuClose();
  };

  return (
    <div
      className={parseCssDark('event_detail__row', isDark)}
      onClick={handleMenuOpen}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.CircleFill
          className={'svg-icon calendar-content-svg'}
          fill={calendarColors[calendar.color][isDark ? 'dark' : 'light']}
        />
      </div>
      <div className={'event_detail__button'} onClick={handleMenuOpen}>
        <p className={parseCssDark('event_detail__input', isDark)}>
          {calendar.name}
        </p>
      </div>
      {isOpen ? (
        !isMobile ? (
          <DropdownWrapper
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            handleClose={handleMenuClose}
          >
            <MyMenu
              variant="calendar"
              select={selectOption}
              selected={calendar}
              handleClose={handleMenuClose}
              data={calendars}
            />
          </DropdownWrapper>
        ) : (
          <ModalSmall isOpen={isOpen} handleClose={handleMenuClose}>
            <MyMenu
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

interface IDateFromProps {
  openDateFrom: any;
  openTimeFrom: any;
  isStartDateValid?: boolean;
  startDate: Date;
  allDay: boolean;
}
const DateFrom = (props: IDateFromProps) => {
  const {
    isStartDateValid,
    openDateFrom,
    startDate,
    allDay,
    openTimeFrom,
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
            {formatDate(startDate, DATE_FORMAT)}
          </p>
          <p
            className={`${parseCssDark(
              'event_detail__input-secondary',
              isDark
            )} ${!isStartDateValid ? 'date-error' : ''}`}
          >
            ({formatDate(startDate, WEEK_DAY_FORMAT_SHORT)})
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
              {formatDate(startDate, TIME_FORMAT)}
            </p>
          </ButtonBase>
        ) : null}
      </div>
    </div>
  );
};

interface IDateTillProps {
  openDateTill: any;
  openTimeTill: any;
  isStartDateValid?: boolean;
  endDate: Date;
  allDay: boolean;
}
const DateTill = (props: IDateTillProps) => {
  const {
    isStartDateValid,
    openDateTill,
    endDate,
    allDay,
    openTimeTill,
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
            {formatDate(endDate, DATE_FORMAT)}
          </p>
          <p
            className={`${parseCssDark(
              'event_detail__input-secondary',
              isDark
            )} ${!isStartDateValid ? 'date-error' : ''}`}
          >
            ({formatDate(endDate, WEEK_DAY_FORMAT_SHORT)})
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
              {formatDate(endDate, TIME_FORMAT)}
            </p>
          </ButtonBase>
        ) : null}
      </div>
    </div>
  );
};

interface IAllDayProps {
  allDay: boolean;
  setForm: any;
}
const AllDay = (props: IAllDayProps) => {
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
        <MySwitch
          value={allDay}
          checked={allDay}
          onValueChange={handleClick}
        />
      </div>
    </div>
  );
};

interface IRepeatValueButtonProps {
  label: string;
  handleClick: any;
  value: any;
  style: any;
}
const RepeatValueButton = (props: IRepeatValueButtonProps) => {
  const { label, handleClick, value, style } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={'repeat__value-label'}>{label}</p>
      <ButtonBase
        className={'repeat__value-container'}
        style={style}
        onClick={handleClick}
      >
        <p className={parseCssDark('repeat__value-text', isDark)}>{value}</p>
      </ButtonBase>
    </div>
  );
};
interface IRepeatValueDropdownProps {
  isOpen: any;
  label: string;
  handleOpen: any;
  handleClose: any;
  handleSelect: any;
  value: any;
  values: any;
  style: any;
}
export const RepeatValueDropDown = (props: IRepeatValueDropdownProps) => {
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

  return (
    <div className={'repeat__value-wrapper'}>
      <p className={'repeat__value-label'}>{label}</p>
      <ButtonBase
        className={'repeat__value-container'}
        style={style}
        onClick={handleOpen}
      >
        <p className={'repeat__value-text'}>{value}</p>
        <Dropdown
          isOpen={isOpen}
          handleClose={handleClose}
          selectedValue={value}
          values={values}
          onClick={handleSelect}
          variant={'simple'}
        />
      </ButtonBase>
    </div>
  );
};

interface IRepeatValueInputProps {
  defaultValue?: any;
  label: string;
  type: string;
  name: any;
  onChange: any;
  style: any;
  value: any;
}
export const RepeatValueInput = (props: IRepeatValueInputProps) => {
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

interface IRepeatOptionsProps {
  rRuleState: any;
  setRRule: any;
  handleClose: any;
}
const RepeatOptions = (props: IRepeatOptionsProps) => {
  const { rRuleState, setRRule, handleClose } = props;

  const { freq, interval, until, count } = rRuleState;

  const [freqIsOpen, openFreq] = useState(false);
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
      setRRule('until', '');
      setRRule('count', '');
    } else {
      if (value === 'count') {
        setRRule('count', 7);
      }
      if (!interval) {
        setRRule('interval', 1);
      }
    }
    openFreq(false);
  };
  const selectUntil = (value: any) => {
    if (value === 'date') {
      setRRule('count', null);
      // TODO default date until
      setRRule('until', addYears(new Date(), 1));
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
    setRRule('until', value);
  };

  const handleSave = (): void => {
    handleClose();
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
          <h4 className={'repeat__subtitle'}>Repeat</h4>
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
          handleOpen={() => openFreq(true)}
          handleClose={() => openFreq(false)}
          values={freqValues}
          handleSelect={selectFreq}
          isOpen={freqIsOpen}
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
        <h4 className={'repeat__subtitle'}>Repeat until</h4>
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
            value={format(until, 'dd.MM.yyyy')}
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

interface IRepeatProps {
  setForm: any;
  isRepeated: boolean;
  setRRule: any;
  rRuleState: any;
  coordinates: any;
  setCoordinates: any;
}
const Repeat = (props: IRepeatProps) => {
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

  const height: number = HeightHook();
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
          <ModalSmall isOpen={isOpen} handleClose={handleMenuClose}>
            <MyMenu
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

interface ILocationProps {
  handleChange: any;
  value: string;
}
const Location = (props: ILocationProps) => {
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
      />
    </div>
  );
};

interface INotesProps {
  handleChange: any;
  value: string;
}
const Notes = (props: INotesProps) => {
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
        name="notes"
        placeholder="Add notes"
        autoComplete={'off'}
        className={parseCssDark('event_detail__input', isDark)}
        onChange={handleChange}
        value={value}
        multiline={true}
      />
    </div>
  );
};

interface IEventDetailProps {
  text: string;
  handleChange: any;
  calendar: any;
  location: string;
  startDate: Date;
  endDate: Date;
  isRepeated: boolean;
  isStartDateValid?: any;
  notes: string;
  allDay: boolean;
  setForm: any;
  setRRule: any;
  rRuleState: any;
  reminders: any;
  addNotification: any;
  removeNotification: any;
  isNewEvent: boolean;
  handleScroll: any;
  handleChangeDateFrom: any;
  handleChangeDateTill: any;
}
const EventDetail = (props: IEventDetailProps) => {
  const [isDateFromVisible, openDateFrom] = useState(false);
  const [isTimeFromVisible, openTimeFrom] = useState(false);
  const [isDateTillVisible, openDateTill] = useState(false);
  const [isTimeTillVisible, openTimeTill] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: null, y: null });

  const height: any = HeightHook();
  const width: number = WidthHook();

  const [store] = useContext(Context);
  const { isMobile } = store;

  const {
    text,
    handleChange,
    calendar,
    location,
    startDate,
    endDate,
    isRepeated,
    isStartDateValid,
    notes,
    allDay,
    setForm,
    setRRule,
    rRuleState,
    reminders,
    addNotification,
    removeNotification,
    isNewEvent,
    handleScroll,
    handleChangeDateFrom,
    handleChangeDateTill,
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
      <Title value={text} handleChange={handleChange} isNewEvent={isNewEvent} />
      <Calendar
        calendar={calendar}
        setForm={setForm}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
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
      />
      <AllDay allDay={allDay} setForm={setForm} />
      <Repeat
        setForm={setForm}
        isRepeated={isRepeated}
        rRuleState={rRuleState}
        setRRule={setRRule}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <NotificationSettings
        notifications={reminders}
        addNotification={addNotification}
        removeNotification={removeNotification}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <Location handleChange={handleChange} value={location} />
      <Notes handleChange={handleChange} value={notes} />
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
        >
          {isDateFromVisible && startDate ? (
            <DatePicker
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
            />
          ) : null}
          {isDateTillVisible ? (
            <DatePicker
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
            />
          ) : null}
        </BottomSheetDropdownSwitcher>
      ) : null}
    </div>
  );
};

export default EventDetail;
