import { ButtonBase } from '@material-ui/core';
import React, { useContext } from 'react';
import { parseTimezoneText } from '../../utils/common';
import { EvaIcons, parseCssDark } from 'bloben-react';
import { Context } from 'bloben-module/context/store';

interface TimezoneRowProps {
  timezone: string;
  openTimezoneModal: any;
}
const TimezoneRow = (props: TimezoneRowProps) => {
  const { timezone, openTimezoneModal } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <ButtonBase
      className={parseCssDark('event_detail__row', isDark)}
      onClick={openTimezoneModal}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.Globe className={'svg-icon event-content-svg'} />
      </div>
      <p className={parseCssDark('event_detail__input', isDark)}>
        {parseTimezoneText(timezone)}
      </p>
    </ButtonBase>
  );
};

export default TimezoneRow;
