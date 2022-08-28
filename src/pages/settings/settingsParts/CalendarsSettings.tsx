/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Tag,
  Text,
  useToast,
} from '@chakra-ui/react';

import {
  CalDavAccount,
  CalDavCalendar,
  ReduxState,
} from '../../../types/interface';
import { getAccountCalendars } from '../../../utils/tsdavHelper';
import { getBaseUrl } from '../../../utils/parser';
import { useDispatch, useSelector } from 'react-redux';
import AddCalendarModal from '../../../components/addCalenarModal/AddCalendarModal';

import { TOAST_STATUS } from '../../../types/enums';
import { createToast } from '../../../utils/common';

import { CalendarSettingsResponse } from '../../../bloben-interface/calendarSettings/calendarSettings';
import { Context } from '../../../context/store';
import { DAV_ACCOUNT_TYPE } from '../../../bloben-interface/enums';
import { filter } from 'lodash';
import { getTableSize } from '../../../types/constants';

import { setCalendarSettings } from '../../../redux/actions';
import CalDavCalendarApi from '../../../api/CalDavCalendarApi';
import CalendarSettingsApi from '../../../api/CalendarSettingsApi';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import React, { useContext, useState } from 'react';
import Separator from '../../../components/separator/Separator';

const renderAccountCalendars = (
  account: CalDavAccount,
  calDavCalendars: CalDavCalendar[],
  handleEdit: any,
  handleHide: any,
  openPreDeleteModal: any,
  setDefaultCalendar: any,
  defaultCalendarID: string | null,
  isMobile: boolean
) => {
  const size = getTableSize(isMobile);
  return calDavCalendars.map((calDavCalendar) => {
    return (
      <Flex
        key={calDavCalendar.id}
        direction={'row'}
        marginBottom={3}
        alignItems={'center'}
      >
        <Flex width={isMobile ? 120 : 150}>
          <Text>
            {calDavCalendar.displayName}{' '}
            {calDavCalendar.isHidden ? '(hidden)' : ''}
            {defaultCalendarID === calDavCalendar.id ? '(default)' : ''}
          </Text>
        </Flex>
        <Flex direction={'row'} justifyContent={'flex-start'}>
          {calDavCalendar.components.map((component: string) => (
            <Tag
              key={component}
              borderRadius={10}
              padding={1}
              size={'sm'}
              marginRight={2}
            >
              {component}
            </Tag>
          ))}
        </Flex>
        <Spacer />
        <Menu>
          <MenuButton as={Button} _focus={{ boxShadow: 'none' }} size={size}>
            Actions
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleEdit(calDavCalendar, account)}>
              Edit
            </MenuItem>
            {defaultCalendarID !== calDavCalendar.id ? (
              <MenuItem onClick={() => setDefaultCalendar(calDavCalendar)}>
                Make default
              </MenuItem>
            ) : null}
            <MenuItem onClick={() => handleHide(calDavCalendar)}>
              {calDavCalendar.isHidden ? 'Show' : 'Hide'}
            </MenuItem>
            <MenuItem onClick={() => openPreDeleteModal(calDavCalendar)}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    );
  });
};

const renderCalDavAccountCalendars = (
  calDavAccounts: CalDavAccount[],
  calDavCalendars: CalDavCalendar[],
  handleAddCalendar: any,
  handleEdit: any,
  openPreDeleteModal: any,
  setDefaultCalendar: any,
  defaultCalendarID: string | null,
  isMobile: boolean
) => {
  const size = getTableSize(isMobile);
  return filter(
    calDavAccounts,
    (item) => item.accountType === DAV_ACCOUNT_TYPE.CALDAV
  ).map((calDavAccount) => {
    // find all account calendars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accountCalendars = getAccountCalendars(
      calDavAccount,
      calDavCalendars
    );

    const handleHide = async (item: CalDavCalendar) => {
      await CalDavCalendarApi.patchCalendar(item.id, {
        isHidden: !item.isHidden,
      });
    };

    const renderedCalendars = renderAccountCalendars(
      calDavAccount,
      accountCalendars,
      handleEdit,
      handleHide,
      openPreDeleteModal,
      setDefaultCalendar,
      defaultCalendarID,
      isMobile
    );

    return (
      <Flex
        direction={'column'}
        key={calDavAccount.id}
        style={{ marginBottom: 16, padding: isMobile ? 12 : 0 }}
      >
        <Flex direction={'row'} alignItems={'center'}>
          <Heading size={'md'}>
            {getBaseUrl(
              calDavAccount.principalUrl || calDavAccount.username || ''
            )}
          </Heading>
          <Spacer />
          <Button
            _focus={{ boxShadow: 'none' }}
            colorScheme={'pink'}
            size={size}
            onClick={() => {
              handleAddCalendar(calDavAccount);
            }}
          >
            Add
          </Button>
        </Flex>
        <Separator height={16} />
        {renderedCalendars}
      </Flex>
    );
  });
};

const CalendarsSettings = () => {
  const [store] = useContext(Context);
  const { isMobile } = store;
  const toast = useToast();
  const dispatch = useDispatch();

  const calDavAccounts: CalDavAccount[] = useSelector(
    (state: ReduxState) => state.calDavAccounts
  );
  const calDavCalendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const settings: CalendarSettingsResponse = useSelector(
    (state: ReduxState) => state.calendarSettings
  );

  const [calendarInFocus, setCalendarInFocus] = useState<CalDavCalendar | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<CalDavAccount | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] =
    useState<CalDavAccount | null>(null);

  const handleEdit = (item: CalDavCalendar, account: CalDavAccount) => {
    setEditModalVisible(account);
    setCalendarInFocus(item);
  };

  const openPreDeleteModal = (item: CalDavCalendar) => {
    setCalendarInFocus(item);
    setDeleteModalVisible(true);
  };

  const onModalClose = () => {
    if (isLoading) {
      return;
    }
    setCalendarInFocus(null);
    setDeleteModalVisible(false);
    setEditModalVisible(null);
  };

  const handleSetDefaultCalendar = async (calendar: CalDavCalendar) => {
    try {
      setIsLoading(true);

      const response: any = await CalendarSettingsApi.patch({
        defaultCalendarID: calendar.id,
      });

      toast(createToast(response?.data?.message));

      const responseGet = await CalendarSettingsApi.get();

      dispatch(setCalendarSettings(responseGet.data));
      setIsLoading(false);
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
      setIsLoading(false);
    }
  };

  const renderedCalendars = renderCalDavAccountCalendars(
    calDavAccounts,
    calDavCalendars,
    setIsModalOpen,
    handleEdit,
    openPreDeleteModal,
    handleSetDefaultCalendar,
    settings.defaultCalendarID,
    isMobile
  );

  const handleDeleteCalendar = async () => {
    try {
      if (!calendarInFocus) {
        return;
      }
      setIsLoading(true);

      const response: any = await CalDavCalendarApi.deleteCalendar(
        calendarInFocus.id
      );

      toast(createToast(response?.data?.message));
      setCalendarInFocus(null);
      setDeleteModalVisible(false);
      setIsLoading(false);
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
      setIsLoading(false);
    }
  };

  return (
    <>
      {isMobile ? <MobilePageHeader title={'Calendars'} /> : null}
      {!isMobile ? <Separator height={24} /> : null}
      <Flex direction={'column'}>{renderedCalendars}</Flex>
      {isModalOpen ? (
        <AddCalendarModal
          handleClose={() => setIsModalOpen(null)}
          account={isModalOpen}
        />
      ) : null}

      <AlertDialog
        isOpen={deleteModalVisible}
        onClose={onModalClose}
        leastDestructiveRef={undefined}
        isCentered={true}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Calendar
            </AlertDialogHeader>

            <AlertDialogBody>Do you want to delete calendar?</AlertDialogBody>

            <AlertDialogFooter>
              <Button _focus={{ boxShadow: 'none' }} onClick={onModalClose}>
                Cancel
              </Button>
              <Button
                _focus={{ boxShadow: 'none' }}
                isLoading={isLoading}
                colorScheme="red"
                onClick={handleDeleteCalendar}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {editModalVisible && calendarInFocus ? (
        <AddCalendarModal
          handleClose={() => setEditModalVisible(null)}
          account={editModalVisible}
          calendar={calendarInFocus}
        />
      ) : null}
    </>
  );
};

export default CalendarsSettings;
