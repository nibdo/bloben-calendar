import React, { useContext } from 'react';
import './calendar-desktop-navigation.scss';
import { IconButton } from '@material-ui/core';

import HeaderCalendarTitle from '../headerCalendarTitle/HeaderCalendarTitle';
import EvaIcons from '../../bloben-common/components/eva-icons';
import { Context } from '../../bloben-package/context/store';
import { parseCssDark } from '../../bloben-common/utils/common';
import { getNewCalendarDays } from '../../utils/getCalendarDaysAndEvents';

interface CalendarDesktopNavigationProps {
  title: string;
}

/**
 * Title with calendar navigation buttons for desktop layout
 * @param props
 * @constructor
 */
const CalendarDesktopNavigation = (props: CalendarDesktopNavigationProps) => {
  const { title } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const navigateBackwards = async (): Promise<void> =>
    await getNewCalendarDays(false);
  const navigateForward = async (): Promise<void> =>
    await getNewCalendarDays(true);

  return (
    <div
      className={parseCssDark('calendar-desktop-navigation__container', isDark)}
    >
      <div style={{ display: 'flex', width: 300 }}>
        <HeaderCalendarTitle title={title} />
      </div>
      <div className={'calendar-desktop-navigation__buttons'}>
        <IconButton key={'left'} onClick={navigateBackwards}>
          <EvaIcons.ChevronLeft className={parseCssDark('icon-svg', isDark)} />
        </IconButton>
        <IconButton key={'right'} onClick={navigateForward}>
          <EvaIcons.ChevronRight className={parseCssDark('icon-svg', isDark)} />
        </IconButton>
      </div>
    </div>
  );
};

export default CalendarDesktopNavigation;
