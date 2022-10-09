/* tslint:disable:no-magic-numbers */
import React from 'react';

import { CalDavCalendar } from '../../../types/interface';
import { EVENT_TYPE } from '../../../bloben-interface/enums';
import { FLOATING_DATETIME } from 'kalend/layout/constants';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../enums';
import { Stack } from '@chakra-ui/react';
import EventDetailAlarm from '../../../components/eventDetail/eventDetailAlarm/EventDetailAlarm';
import EventDetailCalendar from '../../../components/eventDetail/eventDetailCalendar/EventDetailCalendar';
import EventDetailDates from '../../../components/eventDetail/eventDetailDates/EventDetailDates';
import EventDetailNotes from '../../../components/eventDetail/eventDetailNotes/EventDetailNotes';
import EventDetailRepeat from '../../../components/eventDetail/eventDetailRepeat/EventDetailRepeat';
import EventDetailTitle from '../../../components/eventDetail/eventDetailTitle/EventDetailTitle';

interface TaskDetailProps {
  summary: string;
  handleChange: any;
  calendar: CalDavCalendar;
  startDate: string;
  // endDate: string;
  isRepeated: boolean;
  isStartDateValid?: any;
  description: string;
  allDay: boolean;
  setForm: any;
  rRule: string;
  alarms: any;
  addAlarm: any;
  removeAlarm: any;
  updateAlarm: any;
  isNewEvent: boolean;
  handleChangeDateFrom: any;
  // handleChangeDateTill: any;
  selectCalendar: any;
  form?: any;
  repeatChangeValue?: REPEATED_EVENT_CHANGE_TYPE;
  disabledRRule?: boolean;
}
const TaskDetail = (props: TaskDetailProps) => {
  const {
    summary,
    handleChange,
    calendar,
    startDate,
    isRepeated,
    description,
    allDay,
    setForm,
    isNewEvent,
    handleChangeDateFrom,
    selectCalendar,
    form,
    alarms,
    repeatChangeValue,
    disabledRRule,
  } = props;

  return (
    <Stack spacing={1}>
      <EventDetailTitle
        isNewEvent={isNewEvent}
        value={summary}
        handleChange={handleChange}
        placeholder={'Task title'}
      />
      <EventDetailCalendar
        calendar={calendar}
        selectCalendar={selectCalendar}
        setForm={setForm}
        disabled={
          repeatChangeValue === REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE ||
          repeatChangeValue === REPEATED_EVENT_CHANGE_TYPE.SINGLE
        }
        type={EVENT_TYPE.TASK}
      />
      <EventDetailDates
        startDate={startDate}
        setForm={setForm}
        handleChangeDateFrom={handleChangeDateFrom}
        allDay={allDay}
        timezoneStartAt={FLOATING_DATETIME}
        hideTimezone={true}
      />
      <EventDetailRepeat
        isRepeated={isRepeated}
        setForm={setForm}
        form={form}
        disabledRRule={disabledRRule}
      />
      <EventDetailAlarm
        alarms={alarms}
        addAlarm={props.addAlarm}
        removeAlarm={props.removeAlarm}
        updateAlarm={props.updateAlarm}
      />
      <EventDetailNotes handleChange={handleChange} value={description} />
    </Stack>
  );
};

export default TaskDetail;
