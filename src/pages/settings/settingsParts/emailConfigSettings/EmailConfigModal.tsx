import {
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from '@chakra-ui/react';
import { CALDAV_COMPONENTS } from '../../../../enums';
import { CalDavCalendar, ReduxState } from '../../../../types/interface';
import { ChakraInput, PrimaryButton, Separator } from 'bloben-components';
import { Context, StoreContext } from '../../../../context/store';
import { EmailConfigData } from 'bloben-interface';
import { TOAST_STATUS } from '../../../../types/enums';
import { createToast } from '../../../../utils/common';
import { getSize } from '../../../../types/constants';
import { useSelector } from 'react-redux';
import EmailConfigAccountPart from './EmailConfigAccountPart';
import EmailConfigAliases from './EmailConfigAliases';
import ModalNew from '../../../../components/modalNew/ModalNew';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import StateReducer from '../../../../utils/state-reducer';
import UserEmailConfigApi from '../../../../api/UserEmailConfigApi';

interface EmailConfigModalProps {
  handleClose: any;
  config?: EmailConfigData;
}

const initialState: any = {
  smtpEmail: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpHost: '',
  smtpPassword: '',
  imapPort: 143,
  imapHost: '',
  imapUsername: '',
  imapPassword: '',
  imapSyncingInterval: 30,
  aliases: [],
  defaultAlias: '',
  calendarForImportID: '',
};

const EmailConfigModal = (props: EmailConfigModalProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [store, dispatchContext]: [StoreContext, any] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };
  const { handleClose, config } = props;

  const [state, dispatchState] = useReducer(StateReducer, initialState);
  const setLocalState = (stateName: string, data: any): void => {
    const payload: any = { stateName, type: 'simple', data };
    // @ts-ignore
    dispatchState({ state, payload });
  };

  const calDavCalendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );

  const {
    smtpHost,
    smtpPort,
    smtpPassword,
    smtpUsername,
    imapPassword,
    imapUsername,
    imapHost,
    imapPort,
    imapSyncingInterval,
    aliases,
    defaultAlias,
    calendarForImportID,
  } = state as any;

  const onChange = (e: any): void => {
    const name = e.target.name;
    const value = e.target.value;

    setLocalState(name, value);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const data = {
        smtp: smtpUsername
          ? {
              smtpPort,
              smtpUsername,
              smtpHost,
              smtpPassword: smtpPassword.length ? smtpPassword : null,
            }
          : undefined,
        imap: imapUsername
          ? {
              imapPort,
              imapHost,
              imapUsername,
              imapPassword: imapPassword.length ? imapPassword : null,
            }
          : undefined,
        imapSyncingInterval,
        aliases,
        defaultAlias,
        calendarForImportID: calendarForImportID || null,
      };
      let response;

      if (!config) {
        response = await UserEmailConfigApi.create(data);
      } else {
        response = await UserEmailConfigApi.update(data, config.id);
      }

      toast(createToast(response?.data?.message));
      setIsLoading(false);

      const responseConfig = await UserEmailConfigApi.get();
      setContext('emailConfig', responseConfig.data);

      handleClose();
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
      setIsLoading(false);
    }
  };

  const closeFunc = () => {
    if (!isLoading) {
      handleClose();
    }
  };

  useEffect(() => {
    if (config) {
      if (config.smtp) {
        setLocalState('smtpHost', config.smtp.smtpHost);
        setLocalState('smtpPort', config.smtp.smtpPort);
        setLocalState('smtpUsername', config.smtp.smtpUsername);
        setLocalState('smtpPassword', config.smtp.smtpPassword);
      }
      if (config.imap) {
        setLocalState('imapHost', config.imap.imapHost);
        setLocalState('imapPort', config.imap.imapPort);
        setLocalState('imapUsername', config.imap.imapUsername);
        setLocalState('imapPassword', config.imap.imapPassword);
      }
      setLocalState('aliases', config.aliases);
      setLocalState('defaultAlias', config.defaultAlias);
      setLocalState('calendarForImportID', config.calendarForImportID);
    }
  }, []);

  const setCalendarForImports = async (id: string | null) => {
    setLocalState('calendarForImportID', id);
  };
  const tableSize = getSize(store.isMobile);

  return (
    <ModalNew
      handleClose={closeFunc}
      title={'Add custom email config'}
      closeButton={true}
      preventCloseOnBackdrop={true}
    >
      <>
        <Flex direction={'row'}>
          <EmailConfigAccountPart
            title={'SMTP'}
            prefix={'smtp'}
            onChange={onChange}
            host={smtpHost}
            username={smtpUsername}
            password={smtpPassword}
            port={smtpPort}
          />
          <Separator width={32} />
          <EmailConfigAccountPart
            title={'IMAP'}
            prefix={'imap'}
            onChange={onChange}
            host={imapHost}
            username={imapUsername}
            password={imapPassword}
            port={imapPort}
          />
        </Flex>
        <Separator height={18} />
        <EmailConfigAliases
          aliases={aliases}
          defaultAlias={defaultAlias}
          setLocalState={setLocalState}
        />
        <Separator height={12} />
        <FormControl>
          <FormLabel htmlFor="imapSyncingInterval">
            IMAP syncing interval
          </FormLabel>
          <ChakraInput
            size={'lg'}
            id="imapSyncingInterval"
            name={'imapSyncingInterval'}
            autoComplete={'off'}
            onChange={onChange}
            value={imapSyncingInterval}
          />
        </FormControl>
        <Separator height={25} />
        <Flex direction={'row'} alignItems={'center'}>
          <Text>Automatic importing events to </Text>
          <Separator width={12} />
          <Menu>
            <MenuButton
              as={Button}
              _focus={{ boxShadow: 'none' }}
              size={tableSize}
            >
              {calDavCalendars.find((item) => item.id === calendarForImportID)
                ?.displayName || 'Disabled'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setCalendarForImports(null)}>
                Disable
              </MenuItem>
              {calDavCalendars
                .filter((item) =>
                  item.components?.includes(CALDAV_COMPONENTS.VEVENT)
                )
                ?.map((item) => {
                  return (
                    <MenuItem
                      key={item.id}
                      onClick={() => setCalendarForImports(item.id)}
                    >
                      {item.displayName}
                    </MenuItem>
                  );
                })}
            </MenuList>
          </Menu>
        </Flex>
        <Separator height={24} />
        <Center flexDirection={'column'}>
          <PrimaryButton isLoading={isLoading} onClick={handleSave}>
            Save
          </PrimaryButton>
        </Center>
        <Separator height={15} />
      </>
    </ModalNew>
  );
};

export default EmailConfigModal;
