import React, { useContext } from 'react';

import '../EventDetail.scss';
import './EventDetailDates.scss';

import {
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Context } from '../../../context/store';
import { EvaIcons } from 'components/eva-icons';
import { parseToDateTime } from 'utils/datetimeParser';
import { useWidth } from '../../../utils/layout';
import DatePicker from '../../datePicker/DatePicker';
import FormIcon from '../../formIcon/FormIcon';
import LuxonHelper from 'utils/LuxonHelper';
import TimePicker from '../../timePicker/TimePicker';

const SIDE_MARGIN = 24;

const formatDate = (date: string, timezone: string): string =>
  parseToDateTime(date, timezone).toFormat('d LLL yy');

const formatTime = (date: string, timezone: string): string =>
  parseToDateTime(date, timezone).toFormat('HH:mm');

interface EventDetailDatesProps {
  startDate: string;
  timezoneStartAt: string;
  handleChangeDateFrom: any;
  handleChangeDateTill: any;
  endDate: string;
  timezoneEndAt: string;
  allDay: boolean;
  setStartTimezone: any;
  setForm: any;
}
const EventDetailDates = (props: EventDetailDatesProps) => {
  const {
    startDate,
    timezoneStartAt,
    handleChangeDateFrom,
    handleChangeDateTill,
    endDate,
    timezoneEndAt,
    allDay,
    setForm,
  } = props;

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const width: number = useWidth();

  const startDateFormatted: string = formatDate(startDate, timezoneStartAt);
  const startTimeFormatted: string = formatTime(startDate, timezoneStartAt);
  const endDateFormatted: string = formatDate(endDate, timezoneEndAt);
  const endTimeFormatted: string = formatTime(endDate, timezoneEndAt);

  const startDateString: string = LuxonHelper.setTimezone(
    startDate,
    timezoneStartAt
  );
  const endDateString: string = LuxonHelper.setTimezone(
    endDate,
    timezoneStartAt
  );
  const pickerWidth: number = isMobile ? width - 60 : 250;

  const handleSetAllDay = () => {
    setForm('allDay', !allDay);
  };

  return (
    <>
      <Stack direction={'row'} align={'center'}>
        <FormIcon allVisible isDark={isDark}>
          <EvaIcons.Clock className={'EventDetail-icon'} />
        </FormIcon>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          align={'center'}
          spacing={2}
        >
          <Stack direction={'row'} align={'center'} spacing={2}>
            <Menu isLazy>
              <MenuButton
                as={Button}
                _focus={{ boxShadow: 'none' }}
                style={{ width: isMobile ? 120 : 90 }}
              >
                <Text style={{ fontWeight: 'normal' }}>
                  {startDateFormatted}
                </Text>
              </MenuButton>
              <MenuList>
                <DatePicker
                  width={pickerWidth}
                  sideMargin={SIDE_MARGIN}
                  selectDate={handleChangeDateFrom}
                  selectedDate={startDateString}
                  withInput
                />
              </MenuList>
            </Menu>
            {allDay ? null : (
              <Menu isLazy>
                <MenuButton
                  as={Button}
                  _focus={{ boxShadow: 'none' }}
                  style={{ width: isMobile ? 80 : 70 }}
                >
                  <Text style={{ fontWeight: 'normal' }}>
                    {startTimeFormatted}
                  </Text>
                </MenuButton>
                <MenuList style={{ width: 150 }}>
                  <TimePicker
                    width={150}
                    timezone={timezoneStartAt}
                    selectTime={handleChangeDateFrom}
                    selectedDate={startDateString}
                  />
                </MenuList>
              </Menu>
            )}
          </Stack>
          {!isMobile ? <p>-</p> : null}
          <Stack direction={'row'} align={'center'} spacing={2}>
            <Menu isLazy>
              <MenuButton
                as={Button}
                _focus={{ boxShadow: 'none' }}
                style={{ width: isMobile ? 120 : 90 }}
              >
                <Text style={{ fontWeight: 'normal' }}>{endDateFormatted}</Text>
              </MenuButton>
              <MenuList>
                <DatePicker
                  width={pickerWidth}
                  sideMargin={SIDE_MARGIN}
                  selectDate={handleChangeDateTill}
                  selectedDate={endDateString}
                  withInput
                />
              </MenuList>
            </Menu>
            {allDay ? null : (
              <Menu isLazy>
                <MenuButton
                  as={Button}
                  _focus={{ boxShadow: 'none' }}
                  style={{ width: isMobile ? 80 : 70 }}
                >
                  <Text style={{ fontWeight: 'normal' }}>
                    {endTimeFormatted}
                  </Text>
                </MenuButton>
                <MenuList>
                  <TimePicker
                    width={pickerWidth}
                    timezone={timezoneStartAt}
                    selectTime={handleChangeDateTill}
                    selectedDate={endDateString}
                  />
                </MenuList>
              </Menu>
            )}
          </Stack>
        </Stack>
      </Stack>
      <Stack direction={'row'} align={'center'} style={{ width: '100%' }}>
        <FormIcon allVisible hidden isDark={isDark}>
          <div />
          {/*<EvaIcons.Clock className={'EventDetail-icon'} />*/}
        </FormIcon>
        <Stack
          direction={'row'}
          align={'center'}
          spacing={2}
          style={{ width: '100%' }}
        >
          <Button
            variant={'ghost'}
            onClick={handleSetAllDay}
            _focus={{ boxShadow: 'none' }}
          >
            <Text style={{ paddingRight: 14, fontWeight: 'normal' }}>
              All day
            </Text>
            <Checkbox
              type={'checkbox'}
              size={'lg'}
              _focus={{ boxShadow: 'none' }}
              colorScheme={'pink'}
              isChecked={allDay}
              onChange={handleSetAllDay}
            />
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default EventDetailDates;
