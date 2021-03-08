import React, { useContext, useEffect, useState } from 'react';
import './DatePicker.scss';
import { ButtonBase, IconButton } from '@material-ui/core';
import { useWidth, parseCssDark, EvaIcons } from 'bloben-react';
import { DateTime } from 'luxon';
import { LuxonHelper } from 'bloben-utils';
import { Context } from 'bloben-module/context/store';
import { getMonthDays } from 'components/calendarView/calendar-common';

const parseMonths = (monthNum: number): string => {
  switch (monthNum) {
    case 1:
      return 'January';
    case 2:
      return 'February';
    case 3:
      return 'March';
    case 4:
      return 'April';
    case 5:
      return 'May';
    case 6:
      return 'June';
    case 7:
      return 'July';
    case 8:
      return 'August';
    case 9:
      return 'September';
    case 10:
      return 'October';
    case 11:
      return 'November';
    case 12:
      return 'December';
    default:
      return '';
  }
};

const renderDays = (
  data: any,
  width: number,
  sideMargin: number = 0,
  selectDate: any,
  selectedDate: any,
  monthDayRef: any,
  keyPrefix?: string
) =>
  data.map((item: any) => (
    <OneDay
      key={`${keyPrefix}${item.year}-${item.month}-${item.day}-${item.millisecond}`}
      item={item}
      width={width}
      sideMargin={sideMargin}
      selectDate={selectDate}
      selectedDate={selectedDate}
      monthDayRef={monthDayRef}
    />
  ));

interface OneDayProps {
  item: any;
  width: number;
  sideMargin: number;
  selectDate: any;
  selectedDate: DateTime;
  monthDayRef: any;
}
const OneDay = (props: OneDayProps) => {
  const {
    item,
    width,
    sideMargin,
    selectDate,
    selectedDate,
    monthDayRef,
  } = props;

  const oneSide: number = (width - sideMargin - sideMargin) / 7;

  const oneDayStyle: any = {
    width: `${oneSide}px`,
    height: `${oneSide}px`,
    borderRadius: `${oneSide / 2}px`,
  };

  const isSameMonthValue: boolean = item.hasSame(monthDayRef, 'month');
  const isSelectedDate: boolean = LuxonHelper.isSameDay(item, selectedDate);

  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <ButtonBase
      onClick={() => selectDate(item)}
      className={parseCssDark(
        `date-picker__one-day-container${isSelectedDate ? '--selected' : null}`,
        isDark
      )}
      style={oneDayStyle}
    >
      <p
        className={parseCssDark(
          `date-picker__one-day-text${isSameMonthValue ? '-normal' : ''}${
            isSelectedDate ? '-selected' : ''
          }`,
          isDark
        )}
      >
        {item.day}
      </p>
    </ButtonBase>
  );
};

interface MonthProps {
  keyPrefix?: string;
  data: DateTime[];
  width: number;
  sideMargin: number;
  selectDate: any;
  selectedDate: string;
  addOneMonth: any;
  subOneMonth: any;
}
const Month = (props: MonthProps) => {
  const {
    data,
    width,
    sideMargin,
    selectDate,
    selectedDate,
    addOneMonth,
    subOneMonth,
    keyPrefix,
  } = props;

  const monthDayRef: any = data[14];

  const [store] = useContext(Context);

  const { isDark } = store;

  const days = renderDays(
    data,
    width,
    sideMargin,
    selectDate,
    selectedDate,
    monthDayRef,
    keyPrefix
  );

  const monthTitle: string = parseMonths(monthDayRef ? monthDayRef.month : 1);

  const containerStyle: any = {
    width: width - sideMargin * 2,
    marginLeft: sideMargin,
    marginRight: sideMargin,
  };

  return (
    <div className={'date-picker__container-month'} style={containerStyle}>
      <div className={'date-picker__row'}>
        <h6 className={parseCssDark('date-picker__title-month', isDark)}>
          {monthTitle}
        </h6>
        <IconButton onClick={subOneMonth}>
          <EvaIcons.ChevronLeft className={parseCssDark('icon-svg', isDark)} />
        </IconButton>
        <IconButton onClick={addOneMonth}>
          <EvaIcons.ChevronRight className={parseCssDark('icon-svg', isDark)} />
        </IconButton>
      </div>
      {days}
    </div>
  );
};

interface DatePickerViewProps {
  keyPrefix?: string;
  data: any;
  width: number;
  sideMargin: number;
  selectDate: any;
  selectedDate: string;
  addOneMonth: any;
  subOneMonth: any;
  handleScroll: any;
}
const DatePickerView = (props: DatePickerViewProps) => {
  const {
    width,
    sideMargin,
    handleScroll,
    data,
    selectDate,
    selectedDate,
    addOneMonth,
    subOneMonth,
    keyPrefix,
  } = props;

  return (
    <div
      className={'date-picker__wrapper'}
      id={'date-picker'}
      onScroll={handleScroll}
    >
      <Month
        data={data}
        width={width}
        sideMargin={sideMargin}
        selectDate={selectDate}
        selectedDate={selectedDate}
        addOneMonth={addOneMonth}
        subOneMonth={subOneMonth}
        keyPrefix={keyPrefix}
      />
    </div>
  );
};

const getOneMonth = (date: DateTime) => {
  let rectCount = 0;
  const firstDayInMonth: DateTime = date.set({ day: 1 });

  // Get week day
  let dayInWeek: number = firstDayInMonth.weekday;

  const monthDays: any = [];
  if (dayInWeek === 0) {
    dayInWeek = 7;
  }
  //Find days for first week at the beginning of month
  // @ts-ignore
  for (let i = dayInWeek - 1; i >= 0; i--) {
    monthDays.push(firstDayInMonth.plus({ days: i }));
    rectCount += 1;
  }
  // @ts-ignore
  for (let i = 1; i < 8 - dayInWeek; i++) {
    monthDays.push(firstDayInMonth.plus({ days: i }));
    rectCount += 1;
  }
  //Three weeks in middle
  for (let i = 8 - dayInWeek; rectCount < 42; i++) {
    monthDays.push(firstDayInMonth.plus({ days: i }));
    rectCount += 1;
  }

  return monthDays;
};

interface DatePickerProps {
  keyPrefix?: string;
  data?: any;
  width: number;
  sideMargin: number;
  selectDate: any;
  selectedDate: string;
  addOneMonth?: any;
  subOneMonth?: any;
  handleScroll?: any;
  height?: number;
}
const DatePicker = (props: DatePickerProps) => {
  const { selectDate, selectedDate, width, sideMargin, keyPrefix } = props;
  const widthFromHook: number = useWidth();

  const [months, setMonths]: any = useState([]);

  const getDaysInMonthInit = (date: DateTime) => {
    const initMonths: any = getMonthDays(date);

    setMonths(initMonths);
  };

  const addOneMonth = () => {
    const newMonth: any = getMonthDays(months[14].plus({ months: 1 }));
    setMonths(newMonth);
  };
  const subOneMonth = () => {
    const newMonth: any = getMonthDays(months[14].minus({ months: 1 }));
    setMonths(newMonth);
  };

  useEffect(() => {
    if (!selectedDate) {
      const dateNow: DateTime = DateTime.local();
      getDaysInMonthInit(dateNow);
    } else {
      getDaysInMonthInit(DateTime.fromISO(selectedDate));
    }
  }, []);

  const handleScroll = (e: any) => {
    if (e.target.scrollTop > 0) {
    } else {
    }
    const element: any = document.getElementById('date-picker');
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      // element is at the end of its scroll, load more content
    }
  };

  return (
    <DatePickerView
      keyPrefix={keyPrefix}
      handleScroll={handleScroll}
      width={width ? width : widthFromHook}
      sideMargin={sideMargin}
      data={months}
      selectDate={selectDate}
      selectedDate={selectedDate}
      addOneMonth={addOneMonth}
      subOneMonth={subOneMonth}
    />
  );
};

export default DatePicker;
