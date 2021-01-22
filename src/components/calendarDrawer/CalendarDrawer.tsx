import React, { useContext } from 'react';
import './CalendarDrawer.scss';
import { ButtonBase, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router';
import EvaIcons from 'bloben-common/components/eva-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { setCalendarDays, setCalendarView, setSelectedDate } from '../../redux/actions';
import {
  HEADER_HEIGHT_BASE,
  parseEventColor,
} from '../calendarView/calendar-common';
import CalendarDrawerIcon from '../../assets/icons/CalendarDrawerIcon';
import DatePicker from '../../bloben-package/components/datePicker/DatePicker';
import { HeightHook } from '../../bloben-common/utils/layout';
import { parseCssDark } from '../../bloben-common/utils/common';
import { Context } from '../../bloben-package/context/store';
import { DateTime } from 'luxon';

interface IDrawerItemProps {
  icon?: any;
  text: string;
  onClick: any;
  isSelected?: boolean;
  isDark: boolean;
}
const DrawerItem = (props: IDrawerItemProps) => {
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

interface IViewSwitcherProps {
  changeCalendarView: any;
}
const ViewSwitcher = (props: IViewSwitcherProps) => {
  const { changeCalendarView } = props;
  const calendarView: any = useSelector((state: any) => state.calendarView);

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
        onClick={() => changeCalendarView('agenda')}
        isSelected={calendarView === 'agenda'}
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
        onClick={() => changeCalendarView('day')}
        isSelected={calendarView === 'day'}
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
        onClick={() => changeCalendarView('3days')}
        isSelected={calendarView === '3days'}
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
        onClick={() => changeCalendarView('week')}
        isSelected={calendarView === 'week'}
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
        onClick={() => changeCalendarView('month')}
        isSelected={calendarView === 'month'}
        text={'Month'}
        isDark={isDark}
      />
    </div>
  );
};

interface ICalendarItemProps {
  key: number;
  calendar: any;
  isDark: boolean;
  navToCalendarEdit: any;
}
const CalendarItem = (props: ICalendarItemProps) => {
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

interface ICalendarsProps {
  handleClose: any;
}
const Calendars = (props: ICalendarsProps) => {
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

interface IDrawerSubtitleProps {
  subtitle: string;
}
const DrawerSubtitle = (props: IDrawerSubtitleProps) => {
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

interface ICalendarDrawerProps {
    handleClose: any;
    initCalendar?: any;
}
const CalendarDrawer = (props: ICalendarDrawerProps) => {
  const { handleClose, initCalendar } = props;

  const dispatch: Dispatch = useDispatch();
  const selectedDate: DateTime = useSelector((state: any) => state.selectedDate);

  const [store] = useContext(Context);
  const { isMobile, isDark } = store;

  const drawerHeight: number = HeightHook() - HEADER_HEIGHT_BASE;

  const changeCalendarView = (view: string) => {
    dispatch(setCalendarView(view));
    if (isMobile) {
      handleClose();
    }
  };

  const selectDate = (date: DateTime): void => {
    initCalendar(date);
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
