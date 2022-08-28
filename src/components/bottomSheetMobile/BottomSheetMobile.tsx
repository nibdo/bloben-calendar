import { Button, Divider, Flex, Heading, Stack } from '@chakra-ui/react';
import { CALENDAR_VIEW, CalendarView } from 'kalend';
import { CSS_CLASSES, DRAWER_PATH } from '../../types/enums';
import { Context } from '../../context/store';
import { initialReduxState } from '../../redux/reducers';
import { parseCssDark } from '../../utils/common';
import { replace } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BottomSheet from 'bottom-sheet-react';
import DrawerCalendars from '../drawer/drawerContent/DrawerCalendars';
import PersonIcon from '../eva-icons/person';
import React, { useContext } from 'react';
import Separator from '../separator/Separator';
import SettingsIcon from '../eva-icons/settings';
import UserApi from '../../api/UserApi';

interface BottomSheetMobileProps {
  isBottomSheetOpen: boolean;
  onClose: any;
  setSelectedView: any;
  selectedView: CALENDAR_VIEW;
}
const BottomSheetMobile = (props: BottomSheetMobileProps) => {
  const navigate = useNavigate();
  const { isBottomSheetOpen, onClose, setSelectedView, selectedView } = props;

  const dispatch = useDispatch();
  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const handleLogout = async () => {
    await UserApi.logout();

    dispatch(replace(initialReduxState));
    navigate('/calendar');
    setContext('isLogged', false);
  };

  const handleOpenSettings = () => {
    navigate('/calendar/settings');
  };

  const viewButtonStyle: any = {
    width: '100%',
    justifyContent: 'flex-start',
  };

  return (
    <>
      {isBottomSheetOpen ? (
        <BottomSheet
          {...props}
          backdropClassName={parseCssDark(
            CSS_CLASSES.BOTTOM_SHEET_BACKDROP,
            store.isDark
          )}
          containerClassName={parseCssDark(
            CSS_CLASSES.BOTTOM_SHEET_CONTAINER,
            store.isDark
          )}
          customHeight={350}
          isExpandable={true}
          onClose={onClose}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
            }}
          >
            <Separator height={6} />
            <Heading paddingLeft={4}>Menu</Heading>
            <Separator height={6} />
            <Button
              _focus={{ boxShadow: 'none' }}
              leftIcon={
                <SettingsIcon
                  className={parseCssDark('SettingsMenu__icon', store.isDark)}
                />
              }
              variant={'ghost'}
              onClick={handleOpenSettings}
              isFullWidth={true}
              justifyContent={'flex-start'}
              fontSize={14}
            >
              Settings
            </Button>
            <Button
              _focus={{ boxShadow: 'none' }}
              leftIcon={
                <PersonIcon
                  className={parseCssDark('SettingsMenu__icon', store.isDark)}
                />
              }
              variant={'ghost'}
              onClick={handleLogout}
              isFullWidth={true}
              justifyContent={'flex-start'}
              fontSize={14}
            >
              Logout
            </Button>
            <Separator height={6} />
            <Divider />
            <Separator height={16} />
            <Heading paddingLeft={4}>Views</Heading>
            <Flex direction={'column'} width={'100%'}>
              <Stack spacing={1} direction={'column'}>
                <Button
                  _focus={{ boxShadow: 'none' }}
                  variant={
                    selectedView === CalendarView.AGENDA ? 'solid' : 'ghost'
                  }
                  isFullWidth={true}
                  style={viewButtonStyle}
                  fontWeight={
                    selectedView === CalendarView.AGENDA ? 'bold' : 'normal'
                  }
                  size={'md'}
                  onClick={() => setSelectedView(CalendarView.AGENDA)}
                >
                  Agenda
                </Button>
                <Button
                  _focus={{ boxShadow: 'none' }}
                  variant={
                    selectedView === CalendarView.DAY ? 'solid' : 'ghost'
                  }
                  size={'md'}
                  style={viewButtonStyle}
                  isFullWidth={true}
                  fontWeight={
                    selectedView === CalendarView.DAY ? 'bold' : 'normal'
                  }
                  onClick={() => setSelectedView(CalendarView.DAY)}
                >
                  Day
                </Button>
                <Button
                  _focus={{ boxShadow: 'none' }}
                  variant={
                    selectedView === CalendarView.THREE_DAYS ? 'solid' : 'ghost'
                  }
                  fontWeight={
                    selectedView === CalendarView.THREE_DAYS ? 'bold' : 'normal'
                  }
                  width={24}
                  style={viewButtonStyle}
                  isFullWidth={true}
                  size={'md'}
                  onClick={() => setSelectedView(CalendarView.THREE_DAYS)}
                >
                  Three days
                </Button>
                <Button
                  _focus={{ boxShadow: 'none' }}
                  variant={
                    selectedView === CalendarView.WEEK ? 'solid' : 'ghost'
                  }
                  size={'md'}
                  style={viewButtonStyle}
                  isFullWidth={true}
                  fontWeight={
                    selectedView === CalendarView.WEEK ? 'bold' : 'normal'
                  }
                  onClick={() => setSelectedView(CalendarView.WEEK)}
                >
                  Week
                </Button>
                <Button
                  _focus={{ boxShadow: 'none' }}
                  variant={
                    selectedView === CalendarView.MONTH ? 'solid' : 'ghost'
                  }
                  style={viewButtonStyle}
                  size={'md'}
                  isFullWidth={true}
                  fontWeight={
                    selectedView === CalendarView.MONTH ? 'bold' : 'normal'
                  }
                  onClick={() => setSelectedView(CalendarView.MONTH)}
                >
                  Month
                </Button>
              </Stack>
            </Flex>
            <Divider />
            <Separator height={16} />
            <Heading paddingLeft={4}>Calendars</Heading>
            <Separator height={2} />
            <DrawerCalendars path={DRAWER_PATH.CALENDAR} />
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
};
export default BottomSheetMobile;
