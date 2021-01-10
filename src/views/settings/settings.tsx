import React from 'react';
import './settings.scss';

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

const SettingsRouter = (props: any) =>
  (
    <div>
      <Route path={'/settings/account'}>
        <Modal {...props}>
          <SettingsAccount />
        </Modal>
      </Route>
      <Route path={'/settings/appearance'}>
        <Modal {...props}>
          <Appearance />
        </Modal>
      </Route>
        <Route path={'/settings/security'}>
            <Modal {...props}>
                <SettingsSecurity />
            </Modal>
        </Route>
        <Route exact path={'/settings'}>
            <Modal {...props}>
                <SettingsBaseView />
            </Modal>
        </Route>
    </div>
  );
const SettingsRouterDesktop = (props: any) => {

    return   (
        <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%'}}>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '30%'}}>
                    <SettingsBaseView />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '70%'}}>
                    <Route path={'/settings/account'}>
                        <SettingsAccount />
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
    const dispatch: Dispatch = useDispatch();
    const isMobile: boolean = useSelector((state: any) => state.isMobile);
    const isDark: boolean = useSelector((state: any) => state.isDark);

    const handleLogOut = async (): Promise<void> =>
        logOut(dispatch);

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
                        description={'Delete account'}
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
    const isMobile: boolean = useSelector((state: any) => state.isMobile);

    return (
      isMobile ? <SettingsRouter /> : <SettingsRouterDesktop />
  );
};


const Settings = () =>
  <SettingsView />;

export default Settings;
