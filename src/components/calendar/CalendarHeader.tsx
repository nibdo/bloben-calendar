import { Alert, EvaIcons, Separator } from 'bloben-components';
import {
  Button,
  Center,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Spinner,
} from '@chakra-ui/react';
import { Context, StoreContext } from '../../context/store';
import { checkHasNewVersion, parseCssDark } from '../../utils/common';
import { initialReduxState } from '../../redux/reducers';
import { isElectron } from '../../env';
import { replace } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ButtonStack, { calendarHeaderItems } from '../buttonStack/ButtonStack';
import ElectronApi from '../../api/ElectronApi';
import NewVersionModal from '../newVersionModal/NewVersionModal';
import React, { useContext, useState } from 'react';
import RedCircle from '../redCircle/RedCircle';
import UserApi from '../../api/AuthApi';

interface CalendarHeaderProps {
  kalendRef: any;
  selectedDate: string;
  setSelectedView: any;
  selectedView: any;
  handleRefresh: any;
  handleOpenDrawer: any;
  openSearchModal: any;
  isPublic?: boolean;
}

const CalendarHeader = (props: CalendarHeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [store, dispatchContext]: [StoreContext, any] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };
  const { isSyncing, isMobile, version } = store;

  const {
    kalendRef,
    selectedDate,
    setSelectedView,
    selectedView,
    handleRefresh,
    handleOpenDrawer,
    openSearchModal,
    isPublic,
  } = props;

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [versionModalOpen, openVersionModal] = useState(false);

  const goForward = () => {
    kalendRef?.current?.navigateForward();
  };
  const goBack = () => {
    kalendRef?.current?.navigateBackwards();
  };
  const goToday = () => {
    kalendRef?.current?.navigateToTodayDate();
  };

  const handleOpenSettings = () => {
    setContext('settingsOpen', true);
  };

  const handleLogout = async () => {
    if (isElectron) {
      await ElectronApi.deleteUser();
    } else {
      await UserApi.logout();

      navigate('/calendar');
    }

    dispatch(replace(initialReduxState));
    setContext('isLogged', false);
  };

  const hasNewVersion = checkHasNewVersion(
    version.lastVersion,
    version.dockerImageVersion
  );

  return (
    <Flex
      direction={'column'}
      paddingTop={3}
      paddingLeft={8}
      paddingRight={isMobile ? 6 : 14}
    >
      {!isMobile ? (
        <Flex direction={'row'} justifyContent={'center'}>
          {!isPublic ? (
            <IconButton
              variant={'ghost'}
              aria-label="Drawer"
              icon={
                <EvaIcons.Menu
                  className={parseCssDark('HeaderModal__icon', store.isDark)}
                />
              }
              isRound
              autoFocus={false}
              onClick={handleOpenDrawer}
              style={{ marginLeft: 18 }}
              disabled={selectedView === 'tasks'}
            />
          ) : null}
          <ButtonStack
            items={calendarHeaderItems}
            onClick={setSelectedView}
            selectedValue={selectedView}
          />
          <Flex>
            <Separator width={20} height={0} />
            <IconButton
              _focus={{ boxShadow: 'none' }}
              variant={'ghost'}
              aria-label="Search"
              icon={
                <EvaIcons.Search
                  className={parseCssDark('HeaderModal__icon', store.isDark)}
                />
              }
              isRound
              // size={"sm"}
              autoFocus={false}
              onClick={() => openSearchModal(true)}
            />
            <Separator width={20} height={0} />
            {isSyncing ? (
              <Spinner color="red.500" />
            ) : (
              <IconButton
                _focus={{ boxShadow: 'none' }}
                variant={'ghost'}
                aria-label="Refresh"
                icon={
                  <EvaIcons.Refresh
                    className={parseCssDark('HeaderModal__icon', store.isDark)}
                  />
                }
                isRound
                // size={"sm"}
                autoFocus={false}
                onClick={handleRefresh}
              />
            )}
            <Separator width={20} height={0} />
            <div style={{ position: 'relative' }}>
              {isPublic ? (
                <IconButton
                  variant={'ghost'}
                  aria-label="Settings"
                  icon={
                    <EvaIcons.Settings
                      className={parseCssDark(
                        'HeaderModal__icon',
                        store.isDark
                      )}
                    />
                  }
                  isRound
                  autoFocus={false}
                  onClick={handleOpenSettings}
                  // style={{ marginLeft: 18 }}
                />
              ) : (
                <Menu closeOnSelect={true}>
                  <MenuButton
                    as={IconButton}
                    _focus={{ boxShadow: 'none' }}
                    variant={'ghost'}
                    aria-label="Settings"
                    isRound
                    icon={
                      <EvaIcons.Settings
                        className={parseCssDark(
                          'HeaderModal__icon',
                          store.isDark
                        )}
                      />
                    }
                    fontSize={14}
                    style={{ position: 'relative' }}
                  />
                  <MenuList zIndex={9991}>
                    <MenuItem
                      as={Button}
                      _focus={{ boxShadow: 'none' }}
                      leftIcon={
                        <EvaIcons.Settings
                          className={parseCssDark(
                            'SettingsMenu__icon',
                            store.isDark
                          )}
                        />
                      }
                      variant={'ghost'}
                      onClick={handleOpenSettings}
                      width={'full'}
                      justifyContent={'flex-start'}
                      fontSize={14}
                    >
                      Settings
                    </MenuItem>
                    {hasNewVersion ? (
                      <MenuItem
                        as={Button}
                        _focus={{ boxShadow: 'none' }}
                        leftIcon={
                          <EvaIcons.CircleFill
                            className={parseCssDark(
                              'SettingsMenu__icon-red',
                              store.isDark
                            )}
                          />
                        }
                        variant={'ghost'}
                        onClick={() => openVersionModal(true)}
                        width={'full'}
                        justifyContent={'flex-start'}
                        fontSize={14}
                      >
                        New version
                      </MenuItem>
                    ) : null}
                    <MenuItem
                      as={Button}
                      _focus={{ boxShadow: 'none' }}
                      leftIcon={
                        <EvaIcons.Person
                          className={parseCssDark(
                            'SettingsMenu__icon',
                            store.isDark
                          )}
                        />
                      }
                      variant={'ghost'}
                      onClick={() => setLogoutModalVisible(true)}
                      width={'full'}
                      justifyContent={'flex-start'}
                      fontSize={14}
                    >
                      {isElectron ? 'Delete user' : 'Logout'}
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
              {hasNewVersion ? <RedCircle /> : null}
            </div>
          </Flex>
        </Flex>
      ) : null}
      {selectedView !== 'tasks' ? (
        <Flex
          direction={'row'}
          paddingTop={isMobile ? 0 : 3}
          paddingBottom={3}
          paddingLeft={isMobile ? 0 : 8}
          flex={1}
          // paddingRight={14}
        >
          <Center>
            <Heading as="h3" size="lg">
              {selectedDate}
            </Heading>
          </Center>
          <Spacer />
          {isMobile ? (
            <>
              <Flex flex="1" justifyContent={'flex-end '}>
                <Spacer />
                <IconButton
                  _focus={{ boxShadow: 'none' }}
                  variant={'ghost'}
                  aria-label="Refresh"
                  icon={
                    <EvaIcons.Refresh
                      className={parseCssDark(
                        'HeaderModal__icon',
                        store.isDark
                      )}
                    />
                  }
                  isRound
                  // size={"sm"}
                  autoFocus={false}
                  onClick={handleRefresh}
                />
              </Flex>
            </>
          ) : null}
          {!isMobile ? (
            <Flex flex="1" justifyContent={'flex-end'}>
              <Separator width={12} height={0} />
              <Center w="100px">
                <Button
                  _focus={{ boxShadow: 'none' }}
                  variant={'solid'}
                  fontSize={14}
                  onClick={goToday}
                >
                  Today
                </Button>
              </Center>
              <Center w="50px">
                <IconButton
                  _focus={{ boxShadow: 'none' }}
                  aria-label="Go back calendar"
                  icon={
                    <EvaIcons.ChevronLeft
                      className={parseCssDark(
                        'HeaderModal__icon',
                        store.isDark
                      )}
                    />
                  }
                  isRound
                  onClick={goBack}
                />
              </Center>
              <Center w="50px">
                <IconButton
                  _focus={{ boxShadow: 'none' }}
                  aria-label="Go forward calendar"
                  icon={
                    <EvaIcons.ChevronRight
                      className={parseCssDark(
                        'HeaderModal__icon',
                        store.isDark
                      )}
                    />
                  }
                  isRound
                  onClick={goForward}
                />
              </Center>
              <Center></Center>
            </Flex>
          ) : null}
        </Flex>
      ) : null}
      {versionModalOpen ? (
        <NewVersionModal handleClose={() => openVersionModal(false)} />
      ) : null}

      <Alert
        isOpen={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        header={isElectron ? 'Delete user' : 'Logout'}
        body={
          isElectron ? 'Do you want to delete user?' : 'Do you want to logout?'
        }
        submitText={'Confirm'}
        onSubmit={handleLogout}
      />
    </Flex>
  );
};

export default CalendarHeader;
