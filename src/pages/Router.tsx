import React from 'react';

import { Route, Routes } from 'react-router-dom';
import { SETTINGS_PATHS } from '../types/enums';
import AboutSettings from './settings/settingsParts/AboutSettings';
import AccountSettings from './settings/settingsParts/AccountSettings';
import AcknowledgmentSettings from './settings/settingsParts/AcknowledgmentSettings';
import CalendarsSettings from './settings/settingsParts/CalendarsSettings';
import ContactsSettings from './settings/settingsParts/ContactsSettings';
import EmailConfigSettings from './settings/settingsParts/EmailConfigSettings';
import GeneralSettings from './settings/settingsParts/GeneralSettings';
import HelpSettings from './settings/settingsParts/HelpSettings';
import Main from './main/Main';
import Settings from './settings/Settings';
import SharedCalendarsSettings from './settings/settingsParts/SharedCalendarsSettings';
import SocketioProvider from 'layers/SocketioProvider';
import SyncLayer from 'layers/SyncLayer';
import Toast from '../components/toast/Toast';

const AppRouter = () => {
  return (
    <SocketioProvider>
      <SyncLayer>
        <Routes>
          <Route path={'/'} element={<Main />} />
          <Route path={SETTINGS_PATHS.DEFAULT} element={<Settings />} />
          <Route path={SETTINGS_PATHS.GENERAL} element={<GeneralSettings />} />
          <Route path={SETTINGS_PATHS.ACCOUNTS} element={<AccountSettings />} />
          <Route
            path={SETTINGS_PATHS.CALENDARS}
            element={<CalendarsSettings />}
          />
          <Route
            path={SETTINGS_PATHS.SHARED_CALENDARS}
            element={<SharedCalendarsSettings />}
          />
          <Route path={SETTINGS_PATHS.HELP} element={<HelpSettings />} />
          <Route
            path={SETTINGS_PATHS.EMAIL_CONFIG}
            element={<EmailConfigSettings />}
          />
          <Route
            path={SETTINGS_PATHS.ACKNOWLEDGMENTS}
            element={<AcknowledgmentSettings />}
          />
          <Route path={SETTINGS_PATHS.ABOUT} element={<AboutSettings />} />
          <Route
            path={SETTINGS_PATHS.CONTACTS}
            element={<ContactsSettings />}
          />
        </Routes>
        <Toast />
      </SyncLayer>
    </SocketioProvider>
  );
};

export default AppRouter;
