/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Checkbox,
  Flex,
  Heading,
  Spacer,
  Text,
  useToast,
} from '@chakra-ui/react';

import { CalDavAccount, ReduxState } from '../../../types/interface';
import { getAccountAddressBooks } from '../../../utils/tsdavHelper';
import { getBaseUrl } from '../../../utils/parser';
import { useDispatch, useSelector } from 'react-redux';

import { ITEM_SIZE, TOAST_STATUS } from '../../../types/enums';
import { createToast } from '../../../utils/common';

import { CalendarSettingsResponse } from '../../../bloben-interface/calendarSettings/calendarSettings';
import { Context } from '../../../context/store';
import { DAV_ACCOUNT_TYPE } from '../../../bloben-interface/enums';
import { GetCardDavAddressBooks } from '../../../bloben-interface/cardDavAddressBook/cardDavAddressBook';
import { filter } from 'lodash';
import { getSize } from '../../../types/constants';
import { setCalendarSettings } from '../../../redux/actions';
import CalendarSettingsApi from '../../../api/CalendarSettingsApi';
import CardDavAddressBookApi from '../../../api/CardDavAddressBookApi';
import ContactsModal from '../../../components/contactsModal/ContactsModal';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import PrimaryButton from '../../../components/chakraCustom/primaryButton/PrimaryButton';
import React, { useContext, useEffect, useState } from 'react';
import Separator from '../../../components/separator/Separator';

const renderAccountAddressBooks = (
  account: CalDavAccount,
  addressBooks: GetCardDavAddressBooks[],
  handleMakeDefault: any,
  isDark: boolean,
  settings: CalendarSettingsResponse,
  openContacts: any,
  size: ITEM_SIZE
) => {
  return addressBooks.map((addressBook) => {
    return (
      <Flex
        key={addressBook.id}
        direction={'row'}
        marginBottom={3}
        alignItems={'center'}
      >
        <Flex width={150}>
          <Text>{addressBook.displayName} </Text>
        </Flex>
        <Spacer />
        <PrimaryButton
          isSecondary={true}
          onClick={() => openContacts(addressBook)}
          size={size}
        >
          Contacts
        </PrimaryButton>
        <Separator width={8} />
        {settings.defaultAddressBookID !== addressBook.id ? (
          <PrimaryButton
            isSecondary={true}
            onClick={() => handleMakeDefault(addressBook)}
            size={size}
          >
            Make default
          </PrimaryButton>
        ) : (
          <PrimaryButton isSecondary={true} disabled={true} size={size}>
            Default
          </PrimaryButton>
        )}
      </Flex>
    );
  });
};

const renderAddressBooks = (
  accounts: CalDavAccount[],
  addressBooks: GetCardDavAddressBooks[],
  handleMakeDefault: any,
  isDark: boolean,
  settings: CalendarSettingsResponse,
  openContacts: any,
  isMobile: boolean
) => {
  const size = getSize(isMobile);
  return filter(
    accounts,
    (item) => item.accountType === DAV_ACCOUNT_TYPE.CARDDAV
  ).map((calDavAccount) => {
    // find all account address books
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accountAddressBooks = getAccountAddressBooks(
      calDavAccount,
      addressBooks
    );

    const renderedAddressBooks = renderAccountAddressBooks(
      calDavAccount,
      accountAddressBooks,
      handleMakeDefault,
      isDark,
      settings,
      openContacts,
      size
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
        </Flex>
        <Separator height={16} />
        {renderedAddressBooks}
      </Flex>
    );
  });
};

const ContactsSettings = () => {
  const toast = useToast();
  const dispatch = useDispatch();

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const settings: CalendarSettingsResponse = useSelector(
    (state: ReduxState) => state.calendarSettings
  );

  const calDavAccounts: CalDavAccount[] = useSelector(
    (state: ReduxState) => state.calDavAccounts
  );

  const [addressBooks, setAddressBooks] = useState<GetCardDavAddressBooks[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [addressBookSelected, selectAddressBook] =
    useState<null | GetCardDavAddressBooks>(null);

  const openContacts = (addressBook: GetCardDavAddressBooks) => {
    selectAddressBook(addressBook);
  };

  const handleSetDefaultAddressBook = async (
    addressBook: GetCardDavAddressBooks
  ) => {
    try {
      setIsLoading(true);

      const response: any = await CalendarSettingsApi.patch({
        defaultAddressBookID: addressBook.id,
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

  const handleSetAutoSaveContacts = async () => {
    try {
      setIsLoading(true);

      const response: any = await CalendarSettingsApi.patch({
        saveContactsAuto: !settings.saveContactsAuto,
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

  const renderedAddressBooks = renderAddressBooks(
    calDavAccounts,
    addressBooks,
    handleSetDefaultAddressBook,
    isDark,
    settings,
    openContacts,
    isMobile
  );

  const loadAddressBooks = async () => {
    try {
      setIsLoading(true);

      const response = await CardDavAddressBookApi.getAll();

      if (response.data) {
        setAddressBooks(response.data);
      }

      setIsLoading(false);
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddressBooks();
  }, []);

  return (
    <>
      {isMobile ? (
        <MobilePageHeader title={'Contacts'} />
      ) : (
        <Separator height={24} />
      )}
      <Button
        variant={'ghost'}
        onClick={handleSetAutoSaveContacts}
        _focus={{ boxShadow: 'none' }}
      >
        <Text style={{ paddingRight: 14, fontWeight: 'normal' }}>
          Save contacts automatically
        </Text>
        <Checkbox
          isChecked={settings.saveContactsAuto}
          onChange={handleSetAutoSaveContacts}
          size={'lg'}
        ></Checkbox>
      </Button>
      <Separator height={24} />
      <Flex direction={'column'}>{renderedAddressBooks}</Flex>
      {addressBookSelected ? (
        <ContactsModal
          addressBookID={addressBookSelected.id}
          handleClose={() => selectAddressBook(null)}
        />
      ) : null}
    </>
  );
};

export default ContactsSettings;
