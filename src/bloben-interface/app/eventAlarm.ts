import { ALARM_UNIT } from '../enums';

export interface Alarm {
  amount: number;
  id: string;
  timeUnit: ALARM_UNIT;
}
