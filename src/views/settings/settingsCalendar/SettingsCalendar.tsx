import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDefaultTimezone,
  updateAutoUpdateTimezoneSetting,
  updateTimezoneSetting,
} from '../../../redux/actions';
import { ICalendarSettings } from '../../../types/types';
import CalendarApi from '../../../api/calendar';
import {
  EvaIcons,
  HeaderModal,
  SettingsSubtitle,
  SettingsItem,
  Modal,
  Dropdown,
  MobileTitle,
} from 'bloben-react';
import { Context } from 'bloben-module/context/store';
import { STATUS_CODE_OK, capitalStart } from 'bloben-utils/utils/common';
import TimeZonePicker from 'components/timezonePicker/TimeZonePicker';
import { UserProfile } from 'bloben-react/types/common.types';

interface SettingsCalendarViewProps {
  alarmDropdownIsVisible: boolean;
  setAlarmDropdown: any;
  alarmDropdownValues: string[];
  selectDefaultAlarm: any;
}
const SettingsCalendarView = (props: SettingsCalendarViewProps) => {
  const {
    alarmDropdownIsVisible,
    setAlarmDropdown,
    alarmDropdownValues,
    selectDefaultAlarm,
  } = props;

  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const { isDark, isMobile } = store;

  const dispatch: any = useDispatch();
  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
  );

  const {
    defaultTimezone,
    autoUpdateTimezone,
    defaultAlarmType,
  } = calendarSettings;

  const [timezoneModalIsOpen, openTimezoneModal] = useState(false);

  const selectTimezone = async (timezone: string): Promise<void> => {
    dispatch(setDefaultTimezone(timezone));

    try {
      const result: any = await CalendarApi.updateSettings({
        key: 'timezone',
        value: timezone,
      });

      if (result.status === STATUS_CODE_OK) {
        dispatch(updateTimezoneSetting(timezone));
      } else {
        setContext('showSnackbar', {
          text: 'Error',
        });
      }
    } catch (error) {
      setContext('showSnackbar', {
        text: 'Error',
      });
    }
  };

  const switchTimezoneAutoUpdate = async (): Promise<void> => {
    try {
      const result: any = await CalendarApi.updateSettings({
        key: 'autoUpdateTimezone',
        boolValue: !autoUpdateTimezone,
      });

      if (result.status === STATUS_CODE_OK) {
        dispatch(updateAutoUpdateTimezoneSetting(!autoUpdateTimezone));
      } else {
        setContext('showSnackbar', {
          text: 'Error',
        });
      }
    } catch (error) {
      setContext('showSnackbar', {
        text: 'Error',
      });
    }
  };

  return (
    <div className={`column${isDark ? '-dark' : ''}`}>
      <HeaderModal isMobile={isMobile} isDark={isDark} />
      <div className={'settings__container'}>
        <MobileTitle title={'Calendar'} isDark={isDark} />
        <SettingsSubtitle text={'Timezones'} isDark={isDark} />
        <SettingsItem
          isDark={isDark}
          icon={
            <EvaIcons.Globe
              className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
            />
          }
          title={'Default timezone'}
          description={defaultTimezone}
          onClick={() => openTimezoneModal(true)}
        />
        <SettingsItem
          isDark={isDark}
          icon={<EvaIcons.Globe className={'svg-icon settings__icon-hidden'} />}
          title={'Device timezone'}
          description={'Update to device timezone'}
          onClick={switchTimezoneAutoUpdate}
          toogle={true}
          switchValue={autoUpdateTimezone}
        />
        {timezoneModalIsOpen ? (
          <Modal isDark={isDark}>
            <TimeZonePicker
              selectTimezone={selectTimezone}
              onClose={() => openTimezoneModal(false)}
              floatDisabled={true}
            />
          </Modal>
        ) : null}
        <SettingsSubtitle text={'Alarms'} isDark={isDark} />
        <SettingsItem
          isDark={isDark}
          icon={
            <EvaIcons.Bell
              className={`svg-icon settings__icon${isDark ? '-dark' : ''}`}
            />
          }
          title={'Default alarm'}
          description={capitalStart(defaultAlarmType)}
          onClick={() => setAlarmDropdown(true)}
          dropdown={
            <Dropdown
              isDark={isDark}
              isOpen={alarmDropdownIsVisible}
              handleClose={() => setAlarmDropdown(false)}
              selectedValue={defaultAlarmType}
              values={alarmDropdownValues}
              onClick={selectDefaultAlarm}
            />
          }
        />
      </div>
    </div>
  );
};

const SettingsCalendar = () => {
  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const userProfile: UserProfile = useSelector(
    (state: any) => state.userProfile
  );

  const { emailIsVerified } = userProfile;

  const [alarmDropdownIsVisible, setAlarmDropdown]: any = useState(false);
  const [alarmDropdownValues, setAlarmDropdownValues] = useState([
    'push',
    'email',
  ]);

  const selectDefaultAlarm = async (value: string): Promise<void> => {
    setAlarmDropdown(false);

    if (!emailIsVerified && value !== 'push') {
      setContext('showSnackbar', {
        text: 'Error: You need verified email',
      });

      return;
    }

    await CalendarApi.setDefaultAlarm(value);
  };

  return (
    <SettingsCalendarView
      alarmDropdownIsVisible={alarmDropdownIsVisible}
      setAlarmDropdown={setAlarmDropdown}
      alarmDropdownValues={alarmDropdownValues}
      selectDefaultAlarm={selectDefaultAlarm}
    />
  );
};

export default SettingsCalendar;
