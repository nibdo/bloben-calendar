import React, { useContext } from 'react';
import './CalendarDrawer.scss';
import { ButtonBase, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router';
import { EvaIcons } from 'bloben-react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { setCalendarView, setSelectedDate } from '../../redux/actions';
import {
  HEADER_HEIGHT_BASE,
  parseEventColor,
} from '../calendarView/calendar-common';
import CalendarDrawerIcon from '../../assets/icons/CalendarDrawerIcon';
import { useHeight, parseCssDark } from 'bloben-react';
import { DateTime } from 'luxon';
import {
  CALENDAR_3DAYS_VIEW,
  CALENDAR_AGENDA_VIEW,
  CALENDAR_DAY_VIEW,
  CALENDAR_MONTH_VIEW,
  CALENDAR_WEEK_VIEW,
} from '../../utils/contants';
import { CalendarView, ReduxState } from '../../types/types';
import { initCalendarAction } from '../../utils/initCalendarAction';
import { Context } from 'bloben-module/context/store';
import DatePicker from 'components/datePicker/DatePicker';

interface DrawerItemProps {
  icon?: any;
  text: string;
  onClick: any;
  isSelected?: boolean;
  isDark: boolean;
}
const DrawerItem = (props: DrawerItemProps) => {
  const { icon, text, onClick, isSelected, isDark } = props;

  return (
    <ButtonBase
      className={parseCssDark(
        `calendar-drawer__button${isSelected ? '-selected' : ''}`,
        isDark
      )}
      onClick={onClick}
    >
      {icon ? icon : ''}
      <p className={parseCssDark('calendar-drawer__button-text', isDark)}>
        {text}
      </p>
    </ButtonBase>
  );
};

interface ViewSwitcherProps {
  changeCalendarView: any;
}
const ViewSwitcher = (props: ViewSwitcherProps) => {
  const { changeCalendarView } = props;
  const calendarView: CalendarView = useSelector(
    (state: any) => state.calendarView
  );

  const [store] = useContext(Context);
  const { isDark } = store;

  const iconClassName: string = parseCssDark('svg-icon drawer-icon', isDark);

  return (
    <div>
      <DrawerItem
        icon={
          <CalendarDrawerIcon
            text={'A'}
            textX={'7.8452177'}
            className={iconClassName}
          />
        }
        onClick={() => changeCalendarView(CALENDAR_AGENDA_VIEW)}
        isSelected={calendarView === CALENDAR_AGENDA_VIEW}
        text={'Agenda'}
        isDark={isDark}
      />
      <DrawerItem
        icon={
          <CalendarDrawerIcon
            text={'1'}
            textX={'10.0452177'}
            className={iconClassName}
          />
        }
        onClick={() => changeCalendarView(CALENDAR_DAY_VIEW)}
        isSelected={calendarView === CALENDAR_DAY_VIEW}
        text={'Day'}
        isDark={isDark}
      />
      <DrawerItem
        icon={
          <CalendarDrawerIcon
            text={'3'}
            textX={'8.0452177'}
            className={iconClassName}
          />
        }
        onClick={() => changeCalendarView(CALENDAR_3DAYS_VIEW)}
        isSelected={calendarView === CALENDAR_3DAYS_VIEW}
        text={'3 days'}
        isDark={isDark}
      />
      <DrawerItem
        icon={
          <CalendarDrawerIcon
            text={'7'}
            textX={'8.6452177'}
            className={iconClassName}
          />
        }
        onClick={() => changeCalendarView(CALENDAR_WEEK_VIEW)}
        isSelected={calendarView === CALENDAR_WEEK_VIEW}
        text={'Week'}
        isDark={isDark}
      />
      <DrawerItem
        icon={
          <CalendarDrawerIcon
            text={'31'}
            textX={'5.6452177'}
            className={iconClassName}
          />
        }
        onClick={() => changeCalendarView(CALENDAR_MONTH_VIEW)}
        isSelected={calendarView === CALENDAR_MONTH_VIEW}
        text={'Month'}
        isDark={isDark}
      />
    </div>
  );
};

interface CalendarItemProps {
  key: number;
  calendar: any;
  isDark: boolean;
  navToCalendarEdit: any;
}
const CalendarItem = (props: CalendarItemProps) => {
  const { calendar, isDark, navToCalendarEdit } = props;

  const { id, color, name } = calendar;
  const calendarColor: string = parseEventColor(color, isDark);

  const handleClick = (): void => navToCalendarEdit(id);

  return (
    <ButtonBase className={'calendar-drawer__button'} onClick={handleClick}>
      <EvaIcons.CircleFill
        className={'svg-icon drawer-icon'}
        fill={calendarColor}
      />
      <p className={parseCssDark('calendar-drawer__button-text', isDark)}>
        {name}
      </p>
    </ButtonBase>
  );
};

const renderCalendar = (data: any, isDark: boolean, navToCalendarEdit: any) =>
  data.map((item: any) => (
    <CalendarItem
      key={item.id}
      calendar={item}
      isDark={isDark}
      navToCalendarEdit={navToCalendarEdit}
    />
  ));

interface CalendarsProps {
  handleClose: any;
}
const Calendars = (props: CalendarsProps) => {
  const { handleClose } = props;

  const calendars: any = useSelector((state: any) => state.calendars);

  const [store] = useContext(Context);
  const { isDark } = store;

  const history: any = useHistory();
  const navToCalendarEdit = (id: string): void => {
    handleClose();
    history.push(`/calendar/edit/${id}`);
  };

  const data: any = renderCalendar(calendars, isDark, navToCalendarEdit);

  return <div>{data}</div>;
};

const DrawerSeparator = () => <div style={{ height: 8 }} />;

const DesktopNewCalendar = () => {
  const history: any = useHistory();
  const navigateToNewCalendar = () => history.push('/calendar/new');

  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
      <IconButton size={'small'} onClick={navigateToNewCalendar}>
        <EvaIcons.Plus className={'icon-svg-small'} />
      </IconButton>
    </div>
  );
};

interface DrawerSubtitleProps {
  subtitle: string;
}
const DrawerSubtitle = (props: DrawerSubtitleProps) => {
  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
      }}
    >
      <h4 className={parseCssDark('drawer-subtitle', isDark)}>
        {props.subtitle}
      </h4>
      {!isMobile ? <DesktopNewCalendar /> : null}
    </div>
  );
};

interface CalendarDrawerProps {
  handleClose: any;
}
const CalendarDrawer = (props: CalendarDrawerProps) => {
  const { handleClose } = props;

  const dispatch: Dispatch = useDispatch();
  const selectedDate: DateTime = useSelector(
    (state: any) => state.selectedDate
  );
  const calendarView: CalendarView = useSelector(
    (state: ReduxState): CalendarView => state.calendarView
  );
  const [store] = useContext(Context);
  const { isMobile, isDark } = store;

  const drawerHeight: number = useHeight() - HEADER_HEIGHT_BASE;

  const changeCalendarView = (view: CalendarView) => {
    dispatch(setCalendarView(view));
    if (isMobile) {
      handleClose();
    }
  };

  const selectDate = (date: DateTime): void => {
    initCalendarAction(dispatch, { calendarView, date });
    dispatch(setSelectedDate(date));
  };

  const calendarsStyle: any = {
    height: isMobile ? '100%' : (drawerHeight / 3) * 2,
  };

  return (
    <div className={parseCssDark('calendar-drawer__wrapper', isDark)}>
      {isMobile ? (
        <ViewSwitcher changeCalendarView={changeCalendarView} />
      ) : null}
      {isMobile ? <DrawerSeparator /> : null}
      <div style={calendarsStyle}>
        <DrawerSubtitle subtitle={'Calendars'} />
        <Calendars handleClose={handleClose} />
      </div>
      {!isMobile ? <DrawerSeparator /> : null}
      {!isMobile ? (
        <DatePicker
          keyPrefix={'drawer_calendar'}
          selectDate={selectDate}
          selectedDate={selectedDate.toString()}
          width={214}
          sideMargin={14}
        />
      ) : null}
    </div>
  );
};

export default CalendarDrawer;
