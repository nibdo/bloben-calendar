import React, { useContext, useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import { format } from 'date-fns';
import BottomSheet from 'bottom-sheet-react';

import DatePicker from '../datePicker/DatePicker';
import TimePicker from '../timePicker/TimePicker';
import { useHeight, useWidth } from 'bloben-react';
import { DateTime } from 'luxon';
import { Context } from 'bloben-module/context/store';

interface PickerModalViewProps {
  selectedDate: any;
  setDate: any;
  setTime: any;
  handleCloseModal: any;
  setDatePickerVisible: any;
  datePickerIsVisible: boolean;
  dateOnly: boolean;
  timezone?: string;
}
const PickerModalView = (props: PickerModalViewProps) => {
  const {
    selectedDate,
    setDate,
    setTime,
    handleCloseModal,
    setDatePickerVisible,
    datePickerIsVisible,
    dateOnly,
    timezone,
  } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const width: number = useWidth();
  const height: number = useHeight();

  return (
    <BottomSheet
      backdropClassName={isDark ? 'bottom-sheet__backdrop--dark' : ''}
      containerClassName={isDark ? 'bottom-sheet__container--dark' : ''}
      isExpandable={false}
      customHeight={(height / 4) * (dateOnly ? 2 : 3)}
      onClose={handleCloseModal}
    >
      <div className={'picker__wrapper'}>
        {!dateOnly ? (
          <div className={'picker__row'}>
            <ButtonBase
              onClick={() => setDatePickerVisible(true)}
              className={`picker__button${
                datePickerIsVisible ? '--selected' : ''
              }`}
            >
              Date
            </ButtonBase>
            <ButtonBase
              onClick={() => setDatePickerVisible(false)}
              className={`picker__button${
                datePickerIsVisible ? '' : '--selected'
              }`}
            >
              Time
            </ButtonBase>
          </div>
        ) : null}
        {!dateOnly ? (
          <ButtonBase className={'edit-task__reminder-button'}>
            <p className={'date-picker__date-selected'}>
              {!selectedDate ? 'Date not selected' : ''}
            </p>
            <p className={'date-picker__date-selected'}>
              {selectedDate
                ? format(new Date(selectedDate), 'dd. MM. yyyy, HH:mm')
                : ''}
            </p>
          </ButtonBase>
        ) : null}
        <div className={'picker__container'}>
          {!datePickerIsVisible && timezone ? (
            <TimePicker
              selectTime={setTime}
              selectedDate={selectedDate}
              timezone={timezone}
            />
          ) : (
            <DatePicker
              keyPrefix={'pickerModal'}
              width={width - 48}
              sideMargin={24}
              height={(height / 6) * 4}
              selectDate={setDate}
              selectedDate={selectedDate}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

interface PickerModalProps {
  selectedDate: any;
  handleCloseModal: any;
  dateOnly: boolean;
  selectDate: any;
  timezone?: string;
}
const PickerModal = (props: PickerModalProps) => {
  const [datePickerIsVisible, setDatePickerVisible] = useState(true);
  const {
    selectedDate,
    selectDate,
    handleCloseModal,
    dateOnly,
    timezone,
  } = props;

  const setDate = (date: DateTime) => {
    if (!selectedDate) {
      selectDate(date.set({ hour: DateTime.local().hour }).toString());

      return;
    }
    // If there is reminder set, preserve time from it
    const dateTimeFromIso: DateTime = DateTime.fromISO(selectedDate);
    const dateTime: any = date
      .set({ hour: dateTimeFromIso.hour })
      .set({ minute: dateTimeFromIso.minute })
      .toString();

    selectDate(dateTime);
  };

  const setTime = (date: DateTime) => {
    if (!selectedDate) {
      selectDate(DateTime.local().set({ hour: date.hour }).toString());

      return;
    }
    // If there is reminder set, preserve time from it
    selectDate(date.toString());
  };

  return (
    <PickerModalView
      dateOnly={dateOnly}
      selectedDate={selectedDate}
      setDate={setDate}
      setTime={setTime}
      handleCloseModal={handleCloseModal}
      setDatePickerVisible={setDatePickerVisible}
      datePickerIsVisible={datePickerIsVisible}
      timezone={timezone}
    />
  );
};

export default PickerModal;
