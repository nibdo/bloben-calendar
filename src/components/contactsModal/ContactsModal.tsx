import {
  Button,
  Flex,
  IconButton,
  Spacer,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ChakraModal, EvaIcons, Separator } from 'bloben-components';
import { Context, StoreContext } from '../../context/store';
import { GetCardDavContactsResponse } from '../../bloben-interface';
import { TOAST_STATUS } from '../../types/enums';
import { createToast, parseCssDark } from '../../utils/common';
import { forEach } from 'lodash';
import AddContactModal from '../addContactModal/AddContactModal';
import CardDavContactApi from '../../api/CardDavContactApi';
import React, { useContext, useEffect, useState } from 'react';

const formatEmails = (emails: string[]) => {
  let result = '';

  forEach(emails, (email, index) => {
    result += email;

    if (index + 1 < emails.length) {
      result += ', ';
    }
  });

  return result;
};

const renderContacts = (
  contacts: GetCardDavContactsResponse[],
  handleDelete: any,
  isDark: boolean
) => {
  return contacts.map((contact) => {
    const emails = formatEmails(contact.emails);

    return (
      <Flex direction={'row'} key={contact.id} style={{ padding: 6 }}>
        <Text style={{ fontSize: 14 }}>
          {contact.fullName !== contact.emails[0]
            ? `${contact.fullName} (${emails})`
            : formatEmails(contact.emails)}
        </Text>
        <Spacer />
        <IconButton
          _focus={{ boxShadow: 'none' }}
          variant={'ghost'}
          aria-label="Search"
          icon={
            <EvaIcons.Trash
              className={parseCssDark('HeaderModal__icon', isDark)}
            />
          }
          isRound
          size={'sm'}
          autoFocus={false}
          onClick={() => handleDelete(contact.id)}
        />
      </Flex>
    );
  });
};

interface ContactsModalProps {
  addressBookID: string;
  handleClose: any;
}
const ContactsModal = (props: ContactsModalProps) => {
  const { handleClose, addressBookID } = props;
  const toast = useToast();

  const [store]: [StoreContext] = useContext(Context);
  const { isDark } = store;

  const [contacts, setContacts] = useState<GetCardDavContactsResponse[]>([]);
  const [modalIsOpen, openModal] = useState(false);

  const loadContacts = async () => {
    try {
      const response = await CardDavContactApi.getAll(addressBookID);

      if (response.data) {
        setContacts(response.data);
      }
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await CardDavContactApi.delete(id);

      await loadContacts();

      if (response.data) {
        toast(createToast(response?.data?.message));
      }
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }
  };

  const renderedContacts = renderContacts(contacts, handleDelete, isDark);

  return (
    <ChakraModal handleClose={handleClose} title={'Contacts'} minWidth={600}>
      <>
        <Flex direction={'row'}>
          <Spacer />
          <Button
            _focus={{ boxShadow: 'none' }}
            colorScheme={'pink'}
            onClick={() => {
              openModal(true);
            }}
          >
            Create contact
          </Button>
        </Flex>
        <Separator height={18} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 350,
            overflowX: 'hidden',
            overflowY: 'scroll',
            width: '100%',
          }}
        >
          {renderedContacts}
        </div>
        {modalIsOpen ? (
          <AddContactModal
            handleClose={() => openModal(false)}
            addressBookID={addressBookID}
            loadContacts={loadContacts}
          />
        ) : null}
      </>
    </ChakraModal>
  );
};

export default ContactsModal;
