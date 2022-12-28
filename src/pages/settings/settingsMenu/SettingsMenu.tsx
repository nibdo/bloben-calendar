import './SettingsMenu.scss';
import { Context, StoreContext } from '../../../context/store';
import { EvaIcons, SettingsButton } from 'bloben-components';
import { SETTINGS_PATHS } from '../../../types/enums';
import { Stack } from '@chakra-ui/react';
import { isElectron } from '../../../env';
import { parseCssDark } from '../../../utils/common';
import { useNavigate } from 'react-router-dom';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import React, { useContext } from 'react';

interface SettingsMenuProps {
  setSelected: any;
  selected: string;
}
const SettingsMenu = (props: SettingsMenuProps) => {
  const { setSelected, selected } = props;

  const [store]: [StoreContext] = useContext(Context);
  const { isMobile } = store;

  const navigate = useNavigate();

  const handleClose = () => navigate('/calendar');

  return (
    <div className={'SettingsMenu__wrapper'}>
      {isMobile ? (
        <MobilePageHeader title={'Settings'} handleClose={handleClose} />
      ) : null}
      <Stack
        direction="column"
        spacing={1}
        width={isMobile ? '100%' : undefined}
      >
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.ACCOUNTS}
          onClick={() => {
            setSelected(SETTINGS_PATHS.ACCOUNTS);
          }}
          text={'Accounts'}
          icon={
            <EvaIcons.Person
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.CALENDARS}
          onClick={() => {
            setSelected(SETTINGS_PATHS.CALENDARS);
          }}
          text={'Calendars'}
          icon={
            <EvaIcons.Calendar
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        {isElectron ? null : (
          <SettingsButton
            selected={selected}
            path={SETTINGS_PATHS.SHARED_CALENDARS}
            onClick={() => {
              setSelected(SETTINGS_PATHS.SHARED_CALENDARS);
            }}
            text={'Shared Calendars'}
            icon={
              <EvaIcons.PersonAddIcon
                className={parseCssDark('SettingsMenu__icon', store.isDark)}
              />
            }
          />
        )}
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.CONTACTS}
          onClick={() => {
            setSelected(SETTINGS_PATHS.CONTACTS);
          }}
          text={'Contacts'}
          icon={
            <EvaIcons.Document
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.GENERAL}
          onClick={() => {
            setSelected(SETTINGS_PATHS.GENERAL);
          }}
          text={'General'}
          icon={
            <EvaIcons.Settings
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        {isElectron ? null : (
          <SettingsButton
            selected={selected}
            path={SETTINGS_PATHS.SECURITY}
            onClick={() => {
              setSelected(SETTINGS_PATHS.SECURITY);
            }}
            text={'Security'}
            icon={
              <EvaIcons.Lock
                className={parseCssDark('SettingsMenu__icon', store.isDark)}
              />
            }
          />
        )}
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.EMAIL_CONFIG}
          onClick={() => {
            setSelected(SETTINGS_PATHS.EMAIL_CONFIG);
          }}
          text={'Email'}
          icon={
            <EvaIcons.Email
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.HELP}
          onClick={() => {
            setSelected(SETTINGS_PATHS.HELP);
          }}
          text={'Help'}
          icon={
            <EvaIcons.QuestionCircle
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.ACKNOWLEDGMENTS}
          onClick={() => {
            setSelected(SETTINGS_PATHS.ACKNOWLEDGMENTS);
          }}
          text={'Acknowledgment'}
          icon={
            <EvaIcons.Note
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
        <SettingsButton
          selected={selected}
          path={SETTINGS_PATHS.ABOUT}
          onClick={() => {
            setSelected(SETTINGS_PATHS.ABOUT);
          }}
          text={'About'}
          icon={
            <EvaIcons.Info
              className={parseCssDark('SettingsMenu__icon', store.isDark)}
            />
          }
        />
      </Stack>
    </div>
  );
};

export default SettingsMenu;
