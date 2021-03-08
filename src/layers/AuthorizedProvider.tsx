import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CalendarRouter from 'layers/CalendarRouter';
import {
  setIsAppStarting,
  setSelectedDate,
  setUserProfile,
} from '../redux/actions';
import * as openpgp from 'openpgp';
import { DateTime } from 'luxon';
import { AxiosResponse } from 'axios';
import CalendarLayout from './CalendarLayout';
import CalendarLogic from './CalendarLogic';
import { LoadingScreen, logger } from 'bloben-react';
import { User, verifyUser, AccountApi } from 'bloben-utils';

// Init webworker for better openpgp performance outside main thread
openpgp.initWorker({ path: 'openpgp.worker.js' });

const AuthorizedProvider = () => {
  const dispatch: any = useDispatch();

  // Redux selectors
  const password: string = useSelector((state: any) => state.password);
  const isAppStarting: boolean = useSelector(
    (state: any) => state.isAppStarting
  );
  const selectedDate: any = useSelector((state: any) => state.selectedDate);
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const user: User = useSelector((state: any) => state.user);

  /*
   * First initialization of app
   * Try to load user from database or load remote with saved session
   */
  useEffect(() => {
    // Init authentication
    const initApp: any = async () => {
      dispatch(setIsAppStarting(true));

      try {
        // Check if user is logged
        const userIsLogged: boolean | undefined = await verifyUser(
          user.username,
          dispatch
        );

        if (userIsLogged) {
          // Load app settings
          const userProfile: AxiosResponse = await AccountApi.getUserProfile();

          dispatch(setUserProfile(userProfile.data));
        }

        dispatch(setIsAppStarting(false));
      } catch (error) {
        logger(error);
      }
    };

    initApp();
  }, []);

  // Init DateTime redux dates selected date
  useEffect(() => {
    if (!selectedDate || !selectedDate.isValid) {
      dispatch(setSelectedDate(DateTime.local()));
    }
  }, []);

  // Verify authentication
  const isAuthenticated: boolean =
    user.username !== null && password.length > 1;

  return (
    <div className={`root-wrapper${isDark ? '-dark' : ''}`}>
      {isAuthenticated && selectedDate && selectedDate.isValid ? (
        <CalendarLayout>
          <CalendarLogic>
            <CalendarRouter />
          </CalendarLogic>
        </CalendarLayout>
      ) : null}
      {isAppStarting ? <LoadingScreen isDark={isDark} /> : null}
    </div>
  );
};

export default AuthorizedProvider;
