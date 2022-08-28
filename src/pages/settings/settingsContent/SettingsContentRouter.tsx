import './SettingsContent.scss';
import { Route, Routes } from 'react-router-dom';
import { SETTINGS_PATHS } from '../../../types/enums';
import AboutSettings from '../settingsParts/AboutSettings';
import AccountSettings from '../settingsParts/AccountSettings';
import AcknowledgmentSettings from '../settingsParts/AcknowledgmentSettings';
import CalendarsSettings from '../settingsParts/CalendarsSettings';
import ContactsSettings from '../settingsParts/ContactsSettings';
import EmailConfigSettings from '../settingsParts/EmailConfigSettings';
import GeneralSettings from '../settingsParts/GeneralSettings';
import HelpSettings from '../settingsParts/HelpSettings';
import React from 'react';
import Settings from '../Settings';
import SharedCalendarsSettings from '../settingsParts/SharedCalendarsSettings';

const SettingsContentRouter = () => {
  return (
    <Routes>
      <Route path={SETTINGS_PATHS.DEFAULT} element={<Settings />} />
      <Route path={SETTINGS_PATHS.GENERAL} element={<GeneralSettings />} />
      <Route path={SETTINGS_PATHS.ACCOUNTS} element={<AccountSettings />} />
      <Route path={SETTINGS_PATHS.CALENDARS} element={<CalendarsSettings />} />
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
      <Route path={SETTINGS_PATHS.CONTACTS} element={<ContactsSettings />} />
    </Routes>
  );
};

export default SettingsContentRouter;
