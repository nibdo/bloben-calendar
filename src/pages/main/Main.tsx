import './Main.scss';
import React, { useContext, useEffect, useState } from 'react';

import { APP_PATH, DRAWER_PATH } from '../../types/enums';
import { Context, StoreContext } from '../../context/store';
import { initBaseDateRange } from '../../redux/reducers/baseDateRange';
import { setBaseDateRange } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Calendar from '../../components/calendar/Calendar';
import Settings from '../settings/Settings';

const Main = () => {
  const navigate = useNavigate();
  const [selected] = useState<DRAWER_PATH>(DRAWER_PATH.CALENDAR);

  const [store] = useContext(Context);
  const { settingsOpen, isMobile } = store as StoreContext;

  useEffect(() => {
    if (settingsOpen && isMobile) {
      navigate(APP_PATH.SETTINGS);
    }
  }, [settingsOpen]);

  const dispatch: any = useDispatch();

  useEffect(() => {
    dispatch(setBaseDateRange(initBaseDateRange()));
  }, []);

  const calendarSelected = DRAWER_PATH.CALENDAR === selected;

  return (
    <div className={'Main__wrapper'}>
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {calendarSelected ? <Calendar /> : null}
        </div>
      </div>
      {!isMobile ? <Settings /> : null}
    </div>
  );
};

export default Main;
