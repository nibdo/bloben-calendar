import React, { useContext } from 'react';
import './Settings.scss';

import MobileTitle from 'bloben-package/components/title/Title';
import SettingsItem from 'bloben-package/components/settingsItem/SettingsItem';
import EvaIcons from 'bloben-common/components/eva-icons';
import VersionFooter from '../../bloben-package/components/versionFooter/VersionFooter';
import { Route } from 'react-router-dom';
import SettingsAccount from '../../bloben-package/views/settingsAccount/SettingsAccount';
import Appearance from '../../bloben-package/views/appearance/Appearance';
import { logOut } from '../../bloben-package/utils/logout';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import SettingsSecurity
    from 'bloben-package/views/settingsSecurity/SettingsSecurity';
import Modal from '../../bloben-package/components/modal/Modal';
import HeaderModal from '../../bloben-package/components/headerModal/HeaderModal';
import { Context } from '../../bloben-package/context/store';
import SettingsCalendar from './settingsCalendar/SettingsCalendar';
import { exportData } from '../../utils/functions';
import AccountApi from '../../bloben-package/api/account.api';
import { AxiosResponse } from 'axios';

const SettingsRouter = () =>
  (
    <div>
      <Route path={'/settings/account'}>
        <Modal>
          <SettingsAccount />
        </Modal>
      </Route>
        <Route path={'/settings/calendar'}>
            <Modal >
                <SettingsCalendar />
            </Modal>
        </Route>
      <Route path={'/settings/appearance'}>
        <Modal >
          <Appearance />
        </Modal>
      </Route>
        <Route path={'/settings/security'}>
            <Modal >
                <SettingsSecurity />
            </Modal>
        </Route>
        <Route exact path={'/settings'}>
            <Modal>
                <SettingsBaseView />
            </Modal>
        </Route>
    </div>
  );
const SettingsRouterDesktop = () => {

    return   (
        <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%'}}>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '30%'}}>
                    <SettingsBaseView />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '70%'}}>
                    <Route path={'/settings/account'}>
                        <SettingsAccount />
                    </Route>
                <Route path={'/settings/calendar'}>
                    <SettingsCalendar />
                </Route>
                    <Route path={'/settings/appearance'}>
                        <Appearance />
                    </Route>
                    <Route  path={'/settings/security'}>
                        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                            <SettingsSecurity />
                        </div>
                    </Route>
            </div>
        </div>
    );
}


const SettingsBaseView = () => {
    const [store] = useContext(Context);

    const {isMobile, isDark} = store;

    const dispatch: Dispatch = useDispatch();

    const handleLogOut = async (): Promise<void> =>
        logOut(dispatch);

    const handleExport = async () => {
        const response: AxiosResponse = await AccountApi.exportAll();

        await exportData(response.data)
    }

    return (
        <div className={`settings__wrapper_former${isDark ? '-dark' : ''}`}>
            {isMobile ? (
                    <HeaderModal/>
                ) :
                null
            }
            <div className={'settings__wrapper'}>
                <div className={'settings__container'}>
                    <MobileTitle title={'Settings'} />
                    <SettingsItem
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
                        onClick={() => {window.location.assign('https://bloben.com')}}
                        icon={
                            <EvaIcons.Info
                                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
                            />
                        }
                        title={'About Bloben'}
                    />
                    <SettingsItem
                        onClick={handleLogOut}
                        icon={
                            <EvaIcons.Power
                                className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
                            />
                        }
                        title={'Logout'}
                    />
                </div>
                <VersionFooter />
            </div>
        </div>
    )
}
const SettingsView = () => {
    const [store] = useContext(Context);

    const {isMobile} = store;

    return (
      isMobile ? <SettingsRouter /> : <SettingsRouterDesktop />
  );
};


const Settings = () =>
  <SettingsView />;

export default Settings;
