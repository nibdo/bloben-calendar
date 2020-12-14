import React, { useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { ButtonBase, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './navbar.scss';
import { useHistory } from 'react-router';
import EvaIcons from 'bloben-common/components/eva-icons';
import { isCalendarApp } from '../../bloben-package/utils/common';
import { useSelector } from 'react-redux';

const NavbarDesktop = (props: any) => {
  return <div className={'navbar__wrapper'}></div>;
};

const NavbarView = (props: any) => {
  const {
    handleLeftClick,
    handleCenterClick,
    handleRightClick,
    currentPath,
    isDark,
  } = props;

  return (
    <div className={`navbar__container${isDark ? '-dark' : ''}`}>
      <div className={'navbar__button-container'}>
        <IconButton
          className={'navbar__button--left'}
          onClick={handleLeftClick}
        >
          <EvaIcons.Menu className={`navbar__icon${isDark ? '-dark' : ''}`} />
        </IconButton>
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
    currentPath,
    isDark,
  } = props;

  return (
    <div className={`navbar__container${isDark ? '-dark' : ''}`}>
      <div className={'navbar__button-container'}>
        <ButtonBase
          className={'navbar__button--left'}
          onClick={handleLeftClick}
        >
          <EvaIcons.Calendar
            className={`navbar__icon${isDark ? '-dark' : ''}`}
          />
        </ButtonBase>
      </div>

      <div className={'navbar__button-container'}>
        <ButtonBase
            className={'navbar__button--left'}
          onClick={handleCenterClick}
        >
          <EvaIcons.Search className={`navbar__icon${isDark ? '-dark' : ''}`} />
        </ButtonBase>
      </div>

      <div className={'navbar__button-container'}>
        <IconButton
          className={'navbar__button--right'}
          onClick={handleRightClick}
        >
          <EvaIcons.Menu className={`navbar__icon${isDark ? '-dark' : ''}`} />
        </IconButton>
      </div>
    </div>
  );
};

const getCurrentPath = (pathName: string) => {
  const pathRaw: string = pathName.slice(1, pathName.length);

  return pathRaw.slice(0, pathRaw.indexOf('/'));
};

const Navbar = (props: any) => {
  const isDark: string = useSelector((state: any) => state.isDark);

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
export default Navbar;
