import React from 'react';
import './settings.scss';

import MobileTitle from 'bloben-package/components/title/title';
import HeaderModal from 'components/header-modal';
import SettingsItem from 'bloben-package/components/settings-item/settings-item';
import EvaIcons from 'bloben-common/components/eva-icons';
import VersionFooter from '../../bloben-package/components/version-footer/version-footer';
import { Route, useHistory } from 'react-router-dom';
import Modal from '../../bloben-package/components/modal';
import SettingsAccount from '../../bloben-package/views/settings-account/settings-account';
import Appearance from '../../bloben-package/views/appearance/appearance';
import Header from '../../components/header';
import { logOut } from '../../bloben-package/utils/logout';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

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
        <Route exact path={'/settings'}>
            <Modal {...props}>
                <SettingsBaseView />
            </Modal>
        </Route>
    </div>
  );
const SettingsRouterDesktop = (props: any) =>
  (
    <div style={{ width: '100%' }}>
      <Route path={'/settings/account'}>
        <SettingsAccount />
      </Route>
      <Route path={'/settings/appearance'}>
        <Appearance />
      </Route>
    </div>
  );

const SettingsBaseView = (props: any ) => {
    const dispatch: Dispatch = useDispatch();
    const isMobile: boolean = useSelector((state: any) => state.isMobile);
    const isDark: boolean = useSelector((state: any) => state.isDark);

    const handleLogOut = async (): Promise<void> =>
        logOut(dispatch);

    return (
        <div className={`column${isDark ? '-dark' : ''}`}>
            {isMobile ? (
                <HeaderModal />
            ) : (
                <Header title={'Settings'} hasHeaderShadow={false} />
            )}
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
const SettingsView = (props: any) => {
    const isMobile: boolean = useSelector((state: any) => state.isMobile);
    const history: any = useHistory();
    const isOnSubScreen: boolean = history.location.pathname.length > '/settings/'.length

    return (
      isMobile ? <SettingsRouter /> : <SettingsRouterDesktop />
  );
};

const Settings = () =>
  <SettingsView />;

export default Settings;
