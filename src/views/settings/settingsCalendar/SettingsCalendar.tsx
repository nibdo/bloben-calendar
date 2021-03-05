import React, { useContext, useState } from 'react';
import EvaIcons from '../../../bloben-common/components/eva-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDefaultTimezone,
  updateAutoUpdateTimezoneSetting,
  updateTimezoneSetting,
} from '../../../redux/actions';
import { Context } from '../../../bloben-package/context/store';
import HeaderModal from '../../../bloben-package/components/headerModal/HeaderModal';
import SettingsItem from '../../../bloben-package/components/settingsItem/SettingsItem';
import MobileTitle from '../../../bloben-package/components/title/Title';
import SettingsSubtitle from '../../../bloben-package/components/settings/settingsSubtitle/SettingsSubtitle';
import Modal from '../../../bloben-package/components/modal/Modal';
import TimeZonePicker from '../../../bloben-package/components/timezonePicker/TimeZonePicker';
import { ICalendarSettings } from '../../../types/types';
import CalendarApi from '../../../api/calendar';
import { STATUS_CODE_OK } from '../../../bloben-common/utils/common';
import Dropdown from '../../../bloben-package/components/dropdown/Dropdown';
import { capitalStart } from '../../../bloben-package/utils/common';
import { UserProfile } from '../../../bloben-package/types/common.types';

interface ISettingsCalendarViewProps {
  alarmDropdownIsVisible: boolean;
  setAlarmDropdown: any;
  alarmDropdownValues: string[];
  selectDefaultAlarm: any;
}
const SettingsCalendarView = (props: ISettingsCalendarViewProps) => {
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

  const { isDark } = store;

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
      <HeaderModal />
      <div className={'settings__container'}>
        <MobileTitle title={'Calendar'} />
        <SettingsSubtitle text={'Timezones'} />
        <SettingsItem
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
          icon={<EvaIcons.Globe className={'svg-icon settings__icon-hidden'} />}
          title={'Device timezone'}
          description={'Update to device timezone'}
          onClick={switchTimezoneAutoUpdate}
          toogle={true}
          switchValue={autoUpdateTimezone}
        />
        {timezoneModalIsOpen ? (
          <Modal>
            <TimeZonePicker
              selectTimezone={selectTimezone}
              onClose={() => openTimezoneModal(false)}
              floatDisabled={true}
            />
          </Modal>
        ) : null}
        <SettingsSubtitle text={'Alarms'} />
        <SettingsItem
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
