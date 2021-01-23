import React, { useContext, useState } from 'react';
import EvaIcons from '../../../bloben-common/components/eva-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
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

const SettingsCalendarView = () => {
  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const { isDark } = store;

  const dispatch: any = useDispatch();
  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
  );

  const { defaultTimezone, autoUpdateTimezone } = calendarSettings;

  const [timezoneModalIsOpen, openTimezoneModal] = useState(false);

  const selectTimezone = async (timezone: string): Promise<void> => {
    dispatch(setDefaultTimezone(timezone));

    try {
      const result: any = await CalendarApi.updateSettings({ timezone });

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
        autoUpdateTimezone: !autoUpdateTimezone,
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
      </div>
    </div>
  );
};

const SettingsCalendar = () => {

  return <SettingsCalendarView />;
};

export default SettingsCalendar;
