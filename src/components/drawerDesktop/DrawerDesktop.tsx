import './DrawerDesktop.scss';
import { Button, Heading, Text } from '@chakra-ui/react';
import {
  CalDavAccount,
  CalDavCalendar,
  ReduxState,
} from '../../types/interface';
import { Context } from '../../context/store';
import { EvaIcons } from 'components/eva-icons';
import { WebcalCalendar } from '../../redux/reducers/webcalCalendars';
import { getAccountCalendars } from '../../utils/tsdavHelper';
import { getBaseUrl } from '../../utils/parser';
import { parseCssDark } from '../../utils/common';
import { useSelector } from 'react-redux';
import CalDavCalendarApi from '../../api/CalDavCalendarApi';
import React, { useContext } from 'react';
import WebcalCalendarApi from '../../api/WebcalCalendarApi';

const renderAccountCalendars = (
  accountCalendars: CalDavCalendar[],
  handleClick: any,
  isDark: boolean
) => {
  return accountCalendars
    .filter((item) => item.components?.includes('VEVENT'))
    .sort((a, b) => {
      return a.displayName > b.displayName ? 1 : -1;
    })
    .map((item) => {
      const iconStyle: any = {
        fill: item.color,
        width: 20,
        height: 20,
        filter: isDark ? 'saturate(60%) brightness(120%)' : '',
      };
      return (
        <Button
          variant={'ghost'}
          onClick={() => handleClick(item)}
          key={item.url}
          isFullWidth={true}
          style={{
            justifyContent: 'flex-start',
          }}
        >
          {!item.isHidden ? (
            <EvaIcons.RadioOn style={iconStyle} />
          ) : (
            <EvaIcons.RadioOff style={iconStyle} />
          )}
          <Text style={{ marginLeft: 8 }}>{item.displayName}</Text>
        </Button>
      );
    });
};

const renderCalDavCalendars = (
  calendars: CalDavCalendar[],
  isDark: boolean,
  calDavAccounts: CalDavAccount[],
  handleClick: any
) => {
  return calDavAccounts.map((account) => {
    const accountCalendars = renderAccountCalendars(
      getAccountCalendars(account, calendars),
      handleClick,
      isDark
    );

    return (
      <div
        className={'DrawerDesktop__container-section'}
        key={account.principalUrl}
      >
        <p className={'CalendarDrawer__calendar-title'}>
          {getBaseUrl(account.principalUrl || account.username || '')}
        </p>
        <div className={'DrawerDesktop__container'}>{accountCalendars}</div>
      </div>
    );
  });
};

const renderWebcalCalendars = (
  calendars: WebcalCalendar[],
  isDark: boolean,
  handleClick: any
) => {
  return calendars
    .sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    })
    .map((item) => {
      const iconStyle: any = {
        fill: item.color,
        width: 20,
        height: 20,
        filter: isDark ? 'saturate(60%) brightness(120%)' : '',
      };
      return (
        <Button
          key={item.url}
          variant={'ghost'}
          onClick={() => handleClick(item)}
          isFullWidth={true}
          style={{
            justifyContent: 'flex-start',
          }}
        >
          {!item.isHidden ? (
            <EvaIcons.RadioOn style={iconStyle} />
          ) : (
            <EvaIcons.RadioOff style={iconStyle} />
          )}
          <Text style={{ marginLeft: 8 }}>{item.name}</Text>
        </Button>
      );
    });
};

const CalDavDrawer = () => {
  const [store] = useContext(Context);

  const { isDark } = store;
  const calDavAccounts: CalDavAccount[] = useSelector(
    (state: ReduxState) => state.calDavAccounts
  );
  const calDavCalendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const webcalCalendars: WebcalCalendar[] = useSelector(
    (state: ReduxState) => state.webcalCalendars
  );

  const handleHide = async (item: CalDavCalendar) => {
    await CalDavCalendarApi.patchCalendar(item.id, {
      isHidden: !item.isHidden,
    });
  };
  const handleHideWebcal = async (item: WebcalCalendar) => {
    await WebcalCalendarApi.patchCalendar(item.id, {
      isHidden: !item.isHidden,
    });
  };
  const calDavCalendarsRendered = renderCalDavCalendars(
    calDavCalendars,
    isDark,
    calDavAccounts,
    handleHide
  );

  const webcalCalendarsRendered = renderWebcalCalendars(
    webcalCalendars,
    isDark,
    handleHideWebcal
  );

  return (
    <>
      <div className={'DrawerDesktop__container-section'}>
        <div className={'DrawerDesktop__container'}>
          <Heading style={{ paddingLeft: 12, marginTop: 16 }} size={'lg'}>
            CalDAV
          </Heading>
        </div>
      </div>
      {calDavCalendarsRendered}
      <div className={'DrawerDesktop__container-section'}>
        <div className={'DrawerDesktop__container'}>
          <Heading style={{ paddingLeft: 12, marginTop: 16 }} size={'lg'}>
            Webcal
          </Heading>
        </div>
        <div className={'DrawerDesktop__container'}>
          {webcalCalendarsRendered}
        </div>
      </div>
    </>
  );
};

const DrawerDesktop = () => {
  const [store] = useContext(Context);

  const { isDark } = store;
  return (
    <div className={parseCssDark('DrawerDesktop__wrapper', isDark)}>
      <CalDavDrawer />
    </div>
  );
};

export default DrawerDesktop;
