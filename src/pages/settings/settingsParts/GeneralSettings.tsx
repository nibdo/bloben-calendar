import {
  Box,
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  CalendarSettingsResponse,
  PatchCalendarSettingsRequest,
} from '../../../bloben-interface/calendarSettings/calendarSettings';
import { CalendarView } from 'kalend';
import { Context } from '../../../context/store';
import {
  DEFAULT_TIME_SETTINGS,
  THEME_SETTINGS,
  ThemeSettings,
} from '../../../redux/reducers/themeSettings';
import { ReduxState } from '../../../types/interface';
import { capitalStart } from '../../../utils/common';
import { getSize } from '../../../types/constants';
import {
  setCalendarSettings,
  setSettings,
  setThemeSettings,
} from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import CalendarSettingsApi from '../../../api/CalendarSettingsApi';
import ChakraInput from '../../../components/chakraCustom/ChakraInput';
import ChakraTimezoneSelect from 'components/chakraCustom/ChakraTimezoneSelect';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import React, { useContext, useEffect, useState } from 'react';
import SettingsRow from '../settingsRow/SettingsRow';

const menuStyle: any = {
  width: '100%',
  justifyContent: 'flex-start',
  textAlign: 'left',
};

const GeneralSettings = () => {
  const [store] = useContext(Context);

  const { isMobile } = store;

  const dispatch = useDispatch();
  const settings: CalendarSettingsResponse = useSelector(
    (state: ReduxState) => state.calendarSettings
  );
  const themeSettings: ThemeSettings = useSelector(
    (state: ReduxState) => state.themeSettings
  );
  const [hourHeightValue, setHourHeightValue] = useState(settings.hourHeight);
  const [themeTimeSettings, setThemeTimeSettings] = useState(
    DEFAULT_TIME_SETTINGS
  );

  const requestUpdate = async (data: PatchCalendarSettingsRequest) => {
    await CalendarSettingsApi.patch(data);

    const response = await CalendarSettingsApi.get();

    dispatch(setCalendarSettings(response.data));
  };

  const handleUpdate = async (key: string, value: any) => {
    const newSettings: any = {};

    newSettings[key] = value;

    await requestUpdate(newSettings);
  };

  const handleTimezoneUpdate = async (item: any) => {
    const newSettings: any = {};

    newSettings.timezone = item.value;

    await requestUpdate(newSettings);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkDisabledViewBox = (value: any) => {
    const newSettings: any = { ...settings };

    let disabledViews: string[] = newSettings.disabledViews;

    if (disabledViews.includes(value)) {
      disabledViews = disabledViews.filter((item) => item !== value);
    } else {
      disabledViews.push(value);
    }

    newSettings['disabledViews'] = disabledViews;

    dispatch(setSettings(newSettings));
  };

  const handleShowWeekNumbersChange = async () => {
    const newSettings: any = {};

    newSettings['showWeekNumbers'] = !settings.showWeekNumbers;

    await requestUpdate(newSettings);
  };

  useEffect(() => {
    setThemeTimeSettings(themeSettings.value);
  }, []);

  const handleUpdateThemeSettings = (
    settingsValue: THEME_SETTINGS,
    value?: any
  ) => {
    const newSettings = {
      settings: settingsValue,
      value: value ? value : DEFAULT_TIME_SETTINGS,
    };
    dispatch(setThemeSettings(newSettings));
  };

  const onChangeTimeSettingsTheme = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;

    const newValue = { ...themeTimeSettings };
    if (name === 'hourFrom') {
      newValue.from.hour = value;
    } else if (name === 'minuteFrom') {
      newValue.from.minute = value;
    } else if (name === 'hourTo') {
      newValue.to.hour = value;
    } else if (name === 'minuteTo') {
      newValue.to.minute = value;
    }

    setThemeTimeSettings(newValue);
  };
  const onBlur = (e: any) => {
    const name = e.target.name;
    const value =
      e.target.value.length === 1 ? `0${e.target.value}` : e.target.value;

    const newValue = { ...themeTimeSettings };

    if (name === 'hourFrom') {
      newValue.from.hour = value;
    } else if (name === 'minuteFrom') {
      newValue.from.minute = value;
    } else if (name === 'hourTo') {
      newValue.to.hour = value;
    } else if (name === 'minuteTo') {
      newValue.to.minute = value;
    }

    setThemeTimeSettings(newValue);

    handleUpdateThemeSettings(THEME_SETTINGS.TIME, newValue);
  };

  const tableSize = getSize(isMobile);

  return (
    <>
      {isMobile ? <MobilePageHeader title={'General settings'} /> : null}
      <Box style={{ padding: isMobile ? 12 : 0 }}>
        <SettingsRow title={'Timezone'}>
          <ChakraTimezoneSelect
            onSelect={handleTimezoneUpdate}
            value={settings.timezone}
            size={tableSize}
          />
        </SettingsRow>
        <SettingsRow title={'Time format'}>
          <Menu>
            <MenuButton
              as={Button}
              style={menuStyle}
              _focus={{ boxShadow: 'none' }}
              size={tableSize}
            >
              {settings.timeFormat}
            </MenuButton>
            <MenuList>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('timeFormat', '24')}
              >
                <span>24</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('timeFormat', '12')}
              >
                <span>12</span>
              </MenuItem>
            </MenuList>
          </Menu>
        </SettingsRow>
        <SettingsRow title={'Start of week'}>
          <Menu>
            <MenuButton
              as={Button}
              style={menuStyle}
              _focus={{ boxShadow: 'none' }}
              size={tableSize}
            >
              {settings.startOfWeek}
            </MenuButton>
            <MenuList>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('startOfWeek', 'Monday')}
              >
                <span>Monday</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('startOfWeek', 'Sunday')}
              >
                <span>Sunday</span>
              </MenuItem>
            </MenuList>
          </Menu>
        </SettingsRow>
        <SettingsRow title={'Default view'}>
          <Menu>
            <MenuButton
              as={Button}
              style={menuStyle}
              _focus={{ boxShadow: 'none' }}
              size={tableSize}
            >
              {settings.defaultView}
            </MenuButton>
            <MenuList>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('defaultView', CalendarView.AGENDA)}
              >
                <span>Agenda</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('defaultView', CalendarView.DAY)}
              >
                <span>Day</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() =>
                  handleUpdate('defaultView', CalendarView.THREE_DAYS)
                }
              >
                <span>3 days</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('defaultView', CalendarView.WEEK)}
              >
                <span>Week</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdate('defaultView', CalendarView.MONTH)}
              >
                <span>Month</span>
              </MenuItem>
            </MenuList>
          </Menu>
        </SettingsRow>
        <SettingsRow title={'Hour height'}>
          <NumberInput
            style={menuStyle}
            defaultValue={settings.hourHeight}
            max={120}
            min={20}
            step={5}
            width={40}
            keepWithinRange={true}
            size={tableSize}
            clampValueOnBlur={false}
            onChange={(valueAsString: string, valueAsNumber: number) => {
              setHourHeightValue(valueAsNumber);
            }}
            onBlur={() => handleUpdate('hourHeight', hourHeightValue)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </SettingsRow>

        <SettingsRow title={'Show week numbers'}>
          <Button
            variant={'ghost'}
            onClick={handleShowWeekNumbersChange}
            _focus={{ boxShadow: 'none' }}
            size={tableSize}
          >
            <Checkbox
              isChecked={settings.showWeekNumbers}
              onChange={handleShowWeekNumbersChange}
              size={'lg'}
            ></Checkbox>
          </Button>
        </SettingsRow>
        <SettingsRow title={'Theme settings'}>
          <Menu>
            <MenuButton
              as={Button}
              style={menuStyle}
              _focus={{ boxShadow: 'none' }}
              size={tableSize}
            >
              {capitalStart(themeSettings.settings)}
            </MenuButton>
            <MenuList>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdateThemeSettings(THEME_SETTINGS.LIGHT)}
              >
                <span>Light</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdateThemeSettings(THEME_SETTINGS.DARK)}
              >
                <span>Dark</span>
              </MenuItem>
              <MenuItem
                minH="40px"
                onClick={() => handleUpdateThemeSettings(THEME_SETTINGS.TIME)}
              >
                <span>Time</span>
              </MenuItem>
            </MenuList>
          </Menu>
        </SettingsRow>
        {themeSettings.settings === THEME_SETTINGS.TIME ? (
          <SettingsRow title={'Light theme range'}>
            <Stack
              direction={'row'}
              spacing={1}
              style={{ alignItems: 'center' }}
            >
              <ChakraInput
                value={themeTimeSettings.from.hour}
                maxLength={2}
                name={'hourFrom'}
                onChange={onChangeTimeSettingsTheme}
                width={14}
                type={'numeric'}
                onBlur={onBlur}
                size={tableSize}
              />
              <Text>:</Text>
              <ChakraInput
                value={themeTimeSettings.from.minute}
                maxLength={2}
                name={'minuteFrom'}
                onChange={onChangeTimeSettingsTheme}
                width={14}
                type={'numeric'}
                onBlur={onBlur}
                size={tableSize}
              />
              <Text> - </Text>
              <ChakraInput
                value={themeTimeSettings.to.hour}
                maxLength={2}
                name={'hourTo'}
                onChange={onChangeTimeSettingsTheme}
                width={14}
                type={'numeric'}
                size={tableSize}
                onBlur={onBlur}
              />
              <Text>:</Text>
              <ChakraInput
                value={themeTimeSettings.to.minute}
                maxLength={2}
                name={'minuteTo'}
                onChange={onChangeTimeSettingsTheme}
                width={14}
                type={'numeric'}
                onBlur={onBlur}
                size={tableSize}
              />
            </Stack>
          </SettingsRow>
        ) : null}
      </Box>
    </>
  );
};

export default GeneralSettings;
