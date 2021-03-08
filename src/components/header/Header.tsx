import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Link } from 'react-router-dom';
import './Header.scss';
import { EvaIcons, Logo, Dropdown } from 'bloben-react';
import { useSelector } from 'react-redux';

import HeaderCalendarTitle from '../headerCalendarTitle/HeaderCalendarTitle';
import { useHistory } from 'react-router';
import { isCalendarApp } from 'utils/common';
import { Context } from 'bloben-module/context/store';

interface ListHeaderIconsProps {
  handleOpenSearch?: any;
}
const ListHeaderIcons = (props: ListHeaderIconsProps) => {
  const { handleOpenSearch } = props;

  const isMobile: boolean = useSelector((state: any) => state.isMobile);
  const isDark: boolean = useSelector((state: any) => state.isDark);

  const [dropdown, setDropdown]: any = useState(false);

  const openDropdown = (e: any) => {
    setDropdown(true);
  };
  const closeDropdown = () => {
    setDropdown(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {isMobile ? (
        <IconButton onClick={handleOpenSearch}>
          <EvaIcons.Search className={`icon-svg ${isDark ? 'dark-svg' : ''}`} />
        </IconButton>
      ) : null}
      {isMobile ? null : (
        <IconButton onClick={openDropdown} style={{ position: 'relative' }}>
          <EvaIcons.Grid className={`icon-svg ${isDark ? 'dark-svg' : ''}`} />
          <Dropdown
            isDark={isDark}
            isOpen={dropdown}
            handleClose={closeDropdown}
            variant={'desktop'}
          />
        </IconButton>
      )}
    </div>
  );
};

interface HeaderMobileProps {
  animation: string;
  children: any;
  searchIsOpen?: boolean;
  handleCloseSearch?: any;
  handleOpenSearch?: any;
  icons?: any;
  routeBack?: any;
  close?: any;
  title?: string;
}
const HeaderMobile = (props: HeaderMobileProps) => {
  const {
    animation,
    children,
    searchIsOpen,
    handleCloseSearch,
    handleOpenSearch,
    icons,
    close,
    routeBack,
    title,
  } = props;

  return (
    <div className={'header__row'}>
      {(routeBack && !searchIsOpen) || (close && !searchIsOpen) ? (
        routeBack ? (
          <Link to={`${props.routeBack}`}>
            <IconButton>
              <EvaIcons.ArrowBack className={'icon-svg'} />
            </IconButton>
          </Link>
        ) : (
          <IconButton onClick={searchIsOpen ? handleCloseSearch : props.close}>
            <EvaIcons.ArrowBack className={'icon-svg'} />
          </IconButton>
        )
      ) : searchIsOpen ? (
        <IconButton onClick={searchIsOpen ? handleCloseSearch : props.close}>
          <EvaIcons.ArrowBack className={'icon-svg'} />
        </IconButton>
      ) : null}
      {searchIsOpen && children ? (
        children
      ) : (
        <div
          style={{
            display: 'flex',
            width: '100%',
            marginLeft: isCalendarApp() ? 12 : '',
          }}
        >
          <HeaderCalendarTitle title={title} animation={animation} />
          <div className={'header__container--icons'}>
            {!icons ? (
              <ListHeaderIcons handleOpenSearch={handleOpenSearch} />
            ) : (
              icons
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface HeaderDesktopProps {
  children: any;
}
const HeaderDesktop = (props: HeaderDesktopProps) => {
  const { children } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'header__row'}>
      <Logo
        isDark={isDark}
        imageClassName={'logo__primary'}
        textClassName={'logo__text-primary'}
      />
      <div className={'header__container--icons'}>{children}</div>
      <div className={'header__container--icons'}>
        <ListHeaderIcons />
      </div>
    </div>
  );
};

interface HeaderViewProps {
  hasHeaderShadow?: boolean;
  icons?: any;
  onClick?: any;
  animation: string;
  children: any;
  title?: string;
  routeBack?: any;
}
const HeaderView = (props: HeaderViewProps) => {
  const {
    hasHeaderShadow,
    icons,
    routeBack,
    animation,
    children,
    title,
  } = props;

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const searchIsOpen: boolean = useSelector((state: any) => state.searchIsOpen);

  const history: any = useHistory();

  const handleCloseSearch = () => {
    children.props.handleClearSearch();
  };
  const handleOpenSearch = () => {
    history.push('/search');
  };

  return (
    <div
      className={`header__wrapper${isDark ? '-dark' : ''} ${
        (hasHeaderShadow && isDark) || (searchIsOpen && isDark)
          ? 'with-dark-shadow'
          : ''
      }${
        (hasHeaderShadow && isMobile && !isDark) || searchIsOpen
          ? 'with-shadow'
          : ''
      }`}
    >
      <div className={'header__row'}>
        {isMobile ? (
          <HeaderMobile
            title={title}
            routeBack={routeBack}
            icons={icons}
            animation={animation}
            children={children}
            handleCloseSearch={handleCloseSearch}
            handleOpenSearch={handleOpenSearch}
            searchIsOpen={searchIsOpen}
          />
        ) : (
          <HeaderDesktop children={children} />
        )}
      </div>
    </div>
  );
};

interface HeaderProps {
  title?: string;
  hasHeaderShadow?: boolean;
  onClick?: any;
  icons?: any;
  children: any;
}
const Header = (props: HeaderProps) => {
  const { title, hasHeaderShadow, onClick, icons, children } = props;

  const [animation, setAnimation] = useState('');

  useEffect(() => {
    if (hasHeaderShadow || isCalendarApp()) {
      setAnimation('header__text-visible');
    } else {
      setAnimation('header__text-hidden');
    }
  }, []);

  useEffect(() => {
    if (hasHeaderShadow || isCalendarApp()) {
      setAnimation('header__text-visible');
    } else {
      setAnimation('header__text-hidden');
    }
  }, [hasHeaderShadow]);

  return (
    <HeaderView
      title={title}
      hasHeaderShadow={hasHeaderShadow}
      onClick={onClick}
      animation={animation}
      icons={icons}
      children={children}
    />
  );
};

export default Header;
