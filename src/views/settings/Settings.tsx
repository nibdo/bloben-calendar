import React, { useContext } from 'react';
import { AxiosResponse } from 'axios';
import {
  EvaIcons,
  SettingsAccount,
  Modal,
  Appearance,
  SettingsSecurity,
  HeaderModal,
  VersionFooter,
  changeTheme,
  SettingsItem,
  MobileTitle,
} from 'bloben-react';
import { Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import './Settings.scss';

import SettingsCalendar from './settingsCalendar/SettingsCalendar';
import { exportData } from '../../utils/functions';
import { logOut, AccountApi, User } from 'bloben-utils';
import { Context } from 'bloben-module/context/store';
import { ReduxState } from '../../types/types';
import { UserProfile } from 'bloben-react/types/common.types';

const SettingsRouter = () => {
  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const user: User = useSelector((state: ReduxState) => state.user);
  const userProfile: UserProfile = useSelector(
    (state: ReduxState) => state.userProfile
  );

  const { isDark, isMobile } = store;

  const showSnackbar = (text: string): void => {
    setContext('showSnackbar', { text });
  };

  return (
    <>
      <Route path={'/settings/account'}>
        <Modal isDark={isDark}>
          <SettingsAccount
            isDark={isDark}
            isMobile={isMobile}
            showSnackbar={showSnackbar}
            handleLogout={logOut}
            userProfile={userProfile}
            username={user.username as string}
          />
        </Modal>
      </Route>
      <Route path={'/settings/calendar'}>
        <Modal isDark={isDark}>
          <SettingsCalendar />
        </Modal>
      </Route>
      <Route path={'/settings/appearance'}>
        <Modal isDark={isDark}>
          <Appearance
            isDark={isDark}
            isMobile={isMobile}
            handleThemeChange={changeTheme}
          />
        </Modal>
      </Route>
      <Route path={'/settings/security'}>
        <Modal isDark={isDark}>
          <SettingsSecurity isDark={isDark} isMobile={isMobile} />
        </Modal>
      </Route>
    </>
  );
};

const Settings = () => {
  const [store] = useContext(Context);

  const { isMobile, isDark } = store;

  const dispatch: Dispatch = useDispatch();

  const handleLogOut = async (): Promise<void> => logOut(dispatch);

  const handleExport = async () => {
    const response: AxiosResponse = await AccountApi.exportAll();

    await exportData(response.data);
  };

  return (
    <div className={`settings__wrapper_former${isDark ? '-dark' : ''}`}>
      {isMobile ? <HeaderModal isMobile={isMobile} isDark={isDark} /> : null}
      <div className={'settings__wrapper'}>
        <div className={'settings__container'}>
          <MobileTitle title={'Settings'} isDark={isDark} />
          <SettingsItem
            isDark={isDark}
            icon={
              <EvaIcons.Person
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'Account'}
            link={'account'}
            description={'Email, Delete account'}
          />
          <SettingsItem
            isDark={isDark}
            icon={
              <EvaIcons.Calendar
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'Calendar'}
            link={'calendar'}
            description={'Timezones, Alarms'}
          />
          <SettingsItem
            isDark={isDark}
            icon={
              <EvaIcons.Lock
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'Security'}
            link={'security'}
            description={'Storage encryption'}
          />
          <SettingsItem
            isDark={isDark}
            icon={
              <EvaIcons.Palette
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'Appearance'}
            link={'appearance'}
            description={'Theme'}
          />
          <SettingsItem
            isDark={isDark}
            onClick={handleExport}
            icon={
              <EvaIcons.Document
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'Export data'}
          />
          {/*<SettingsItem*/}
          {/*    icon={*/}
          {/*        <EvaIcons.Folder*/}
          {/*            className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}*/}
          {/*        />*/}
          {/*    }*/}
          {/*    title={'Data'}*/}
          {/*    description={'Reminder'}*/}
          {/*/>*/}
          {/*<SettingsItem*/}
          {/*    icon={*/}
          {/*        <EvaIcons.Email*/}
          {/*            className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}*/}
          {/*        />*/}
          {/*    }*/}
          {/*    title={'Contact'}*/}
          {/*    description={'Report problems'}*/}
          {/*/>*/}
          <SettingsItem
            isDark={isDark}
            onClick={() => {
              window.location.assign('https://bloben.com');
            }}
            icon={
              <EvaIcons.Info
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'About Bloben'}
          />
          <SettingsItem
            isDark={isDark}
            onClick={handleLogOut}
            icon={
              <EvaIcons.Power
                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
              />
            }
            title={'Logout'}
          />
        </div>
        <VersionFooter isDark={isDark} />
      </div>
      <SettingsRouter />
    </div>
  );
};

export default Settings;
