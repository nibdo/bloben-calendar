import React from 'react';
import './calendar-desktop-navigation.scss';
import { ButtonBase, IconButton } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import HeaderCalendarTitle from '../HeaderCalendarTitle/HeaderCalendarTitle';
import EvaIcons from '../../bloben-common/components/eva-icons';

/**
 * Title with calendar navigation buttons for desktop layout
 * @param props
 * @constructor
 */
const CalendarDesktopNavigation = (props: any) => {
  const {title, getNewCalendarDays} = props;
  const isDark: boolean = useSelector((state: any) => state.isDark);

  const navigateBackwards = (): void =>
      getNewCalendarDays(false);
  const navigateForward = (): void =>
      getNewCalendarDays(true);

  return (
      <div
          className={`calendar-desktop-navigation__container`}
      >
        <div style={{display: 'flex', width: 300}}>
        <HeaderCalendarTitle title={title}/>
        </div>
        <div className={'calendar-desktop-navigation__buttons'}>
          <IconButton key={'left'} onClick={navigateBackwards}>
            <EvaIcons.ChevronLeft className={'icon-svg'} />
          </IconButton>
          <IconButton key={'right'} onClick={navigateForward}>
            <EvaIcons.ChevronRight className={'icon-svg'} />
          </IconButton>
        </div>
      </div>
  );

}

export default CalendarDesktopNavigation;
