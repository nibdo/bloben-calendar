import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Link } from 'react-router-dom';
import './HeaderCalendar.scss';
import EvaIcons from '../../bloben-common/components/eva-icons';
import Dropdown from '../../bloben-package/components/dropdown/Dropdown';
import { isCalendarApp } from '../../bloben-package/utils/common';
import { useSelector } from 'react-redux';
import Logo from '../../bloben-common/components/logo/Logo';
import HeaderCalendarButtons
  from '../headerCalendarButtons/HeaderCalendarButtons';
import HeaderCalendarTitle from '../headerCalendarTitle/HeaderCalendarTitle';
import { Context } from '../../bloben-package/context/store';

interface IListHeaderIconsProps {
  handleOpenSearch: any;
}
const ListHeaderIcons = (props: IListHeaderIconsProps) => {
  const { handleOpenSearch } = props;

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

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
        <IconButton onClick={openDropdown} style={{ position: 'relative', right: 0 }}>
          <EvaIcons.Grid className={`icon-svg ${isDark ? 'dark-svg' : ''}`} />
          <Dropdown
              isOpen={dropdown}
              handleClose={closeDropdown}
              variant={'desktop'}
          />
        </IconButton>

      )}
    </div>
  );
};

interface IHeaderMobileProps {
  children: any;
  searchIsOpen?: boolean;
  handleCloseSearch: any;
  handleOpenSearch: any;
  icons?: any;
  title: string;
  routeBack?: any;
  close?: any;
}
const HeaderMobile = (props: IHeaderMobileProps) => {
  const {
    children,
    searchIsOpen,
    handleCloseSearch,
    handleOpenSearch,
    title,
    icons,
  } = props;

  return (
    <div className={'header__row'}>
      {(props.routeBack && !searchIsOpen) || (props.close && !searchIsOpen) ? (
        props.routeBack ? (
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
          <HeaderCalendarTitle title={title}/>
          <div className={'header__container--icons'}>
            {!icons ? (
              <ListHeaderIcons
                handleOpenSearch={handleOpenSearch}
              />
            ) : (
              icons
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface IHeaderDesktopProps {
  handleOpenSearch?: any;
}
const HeaderDesktop = (props: IHeaderDesktopProps) => {
  const { handleOpenSearch } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <div className={'header__row'}>
      <Logo isDark={isDark} imageClassName={'logo__primary'} textClassName={'logo__text-primary'}/>
      <div className={'header__container--icons'}>
      <HeaderCalendarButtons/>
      </div>
      <div className={'header__container--icons'}>
        <ListHeaderIcons handleOpenSearch={handleOpenSearch}/>
      </div>
    </div>
  );
};

interface IHeaderViewProps {
  hasHeaderShadow: boolean;
  icons?: any;
  animation?: string;
  children: any;
  title: string;
}
const HeaderView = (props: IHeaderViewProps) => {
  const {
    hasHeaderShadow,
    icons,
    animation,
    children,
    title
  } = props;

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const searchIsOpen: boolean = useSelector((state: any) => state.searchIsOpen);

  const handleCloseSearch = () => {
    children.props.handleClearSearch();
    // setContext('searchIsOpen', false);
  };
  const handleOpenSearch = () => {
    // setContext('searchIsOpen', true);
  };

  return (
    // @ts-ignore
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
            icons={icons}
            children={children}
            handleCloseSearch={handleCloseSearch}
            handleOpenSearch={handleOpenSearch}
            searchIsOpen={searchIsOpen}
          />
        ) : (
          <HeaderDesktop  />
        )}
      </div>
    </div>
  );
};

interface IHeaderCalendarProps {
  title: string;
  hasHeaderShadow: boolean;
  icons?: any;
  children: any;
}
const HeaderCalendar = (props: IHeaderCalendarProps) => {
  const { title, hasHeaderShadow, icons, children } = props;

  const [animation, setAnimation] = useState('');

  useEffect(() => {
    if (hasHeaderShadow || isCalendarApp()) {
      setAnimation('header__text-visible');
    } else {
      setAnimation('header__text-hidden');
    }
  },        [hasHeaderShadow]);

  return (
    <HeaderView
      title={title}
      hasHeaderShadow={hasHeaderShadow}
      animation={animation}
      icons={icons}
      children={children}
    />
  );
};

export default HeaderCalendar;
