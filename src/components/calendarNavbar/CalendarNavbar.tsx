import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './CalendarNavbar.scss';
import { useHistory } from 'react-router';
import { EvaIcons, ButtonIcon } from 'bloben-react';
import { Context } from 'bloben-module/context/store';
import { isCalendarApp } from 'utils/common';

const NavbarView = (props: any) => {
  const {
    handleLeftClick,
    handleCenterClick,
    handleRightClick,
    isDark,
  } = props;

  return (
    <div className={`navbar__container${isDark ? '-dark' : ''}`}>
      <div className={'navbar__button-container'}>
        <ButtonIcon onClick={handleLeftClick} isDark={isDark}>
          <EvaIcons.Menu />
        </ButtonIcon>
      </div>
      <div className={'navbar__button-container--center'}>
        <Fab className={`navbar__fab${isDark ? '-dark' : ''}`}>
          <AddIcon
            className={`navbar__fab--icon${isDark ? '-dark' : ''}`}
            onClick={handleCenterClick}
          />
        </Fab>
      </div>

      {/*<div className={'navbar__button--primary'}>*/}

      {/*</div>*/}
      <div className={'navbar__button-container'}>
        <IconButton
          className={'navbar__button--right'}
          onClick={handleRightClick}
        >
          <EvaIcons.Settings
            className={`navbar__icon${isDark ? '-dark' : ''}`}
          />
        </IconButton>
      </div>
    </div>
  );
};

const NavbarViewCalendar = (props: any) => {
  const {
    handleLeftClick,
    handleCenterClick,
    handleRightClick,
    isDark,
  } = props;

  return (
    <div className={`navbar__container${isDark ? '-dark' : ''}`}>
      <div className={'navbar__button-container'}>
        <ButtonIcon
          onClick={handleLeftClick}
          isDark={isDark}
          backdropClassName={'navbar__backdrop-150'}
          noActive={true}
          size={'full'}
          iconSize={'normal'}
        >
          <EvaIcons.Calendar />
        </ButtonIcon>
      </div>

      <div className={'navbar__button-container'}>
        <ButtonIcon
          onClick={handleCenterClick}
          isDark={isDark}
          backdropClassName={'navbar__backdrop-150'}
          noActive={true}
          size={'full'}
          iconSize={'normal'}
        >
          <EvaIcons.Search />
        </ButtonIcon>
      </div>

      <div className={'navbar__button-container'}>
        <ButtonIcon
          onClick={handleRightClick}
          isDark={isDark}
          backdropClassName={'navbar__backdrop-150'}
          noActive={true}
          size={'full'}
          iconSize={'normal'}
        >
          <EvaIcons.Menu />
        </ButtonIcon>
      </div>
    </div>
  );
};

const getCurrentPath = (pathName: string) => {
  const pathRaw: string = pathName.slice(1, pathName.length);

  return pathRaw.slice(0, pathRaw.indexOf('/'));
};

const CalendarNavbar = (props: any) => {
  const [store] = useContext(Context);

  const { isDark } = store;

  const history = useHistory();
  const [currentPath, setCurrentPath] = useState('');
  const { handleLeftClick, handleCenterClick, handleRightClick } = props;

  useEffect(() => {
    const pathFromUrl: string = getCurrentPath(history.location.pathname);
    setCurrentPath(pathFromUrl);
  }, []);

  return isCalendarApp() ? (
    <NavbarViewCalendar
      isDark={isDark}
      handleLeftClick={handleLeftClick}
      handleCenterClick={handleCenterClick}
      handleRightClick={handleRightClick}
    />
  ) : (
    <NavbarView
      currentPath={currentPath}
      handleLeftClick={handleLeftClick}
      handleCenterClick={handleCenterClick}
      handleRightClick={handleRightClick}
      isDark={isDark}
    />
  );
};
export default CalendarNavbar;
