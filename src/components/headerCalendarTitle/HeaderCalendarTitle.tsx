import React from 'react';
import { useSelector } from 'react-redux';
import { parseCssDark } from 'bloben-react';

interface HeaderCalendarTitleProps {
  title?: string;
  animation?: string;
}

/**
 * Calendar title in header in month date format
 * @param props
 * @constructor
 */
const HeaderCalendarTitle = (props: HeaderCalendarTitleProps) => {
  const { title, animation } = props;

  const isDark: boolean = useSelector((state: any) => state.isDark);

  return (
    <div className={`header__title-button ${animation}`}>
      <p className={parseCssDark('header__title', isDark)}>{title}</p>
    </div>
  );
};

export default HeaderCalendarTitle;
