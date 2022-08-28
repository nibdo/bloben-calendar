import { Context } from '../../../context/store';

import { Box, Heading, Text, useToast } from '@chakra-ui/react';
import { TOAST_STATUS } from '../../../types/enums';
import { createToast } from '../../../utils/common';
import { getSize } from '../../../types/constants';
import { refreshUserData } from '../../../redux/functions/user';
import ButtonBase from 'components/chakraCustom/buttonBase/ButtonBase';
import EmailConfigModal from '../../../components/emailConfigModal/EmailConfigModal';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import PrimaryButton from '../../../components/chakraCustom/primaryButton/PrimaryButton';
import React, { useContext, useEffect, useState } from 'react';
import Separator from '../../../components/separator/Separator';
import UserEmailConfigApi from '../../../api/UserEmailConfigApi';

const EmailConfigSettings = () => {
  const [modalOpen, openModal] = useState<boolean>(false);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const { emailConfig, isMobile } = store;
  const tableSize = getSize(isMobile);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await UserEmailConfigApi.delete();

      toast(createToast(response?.data?.message));

      const responseGet = await UserEmailConfigApi.get();

      setContext('emailConfig', responseGet.data);

      setIsLoading(false);
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <>
      {isMobile ? <MobilePageHeader title={'Email config'} /> : null}
      <Box style={{ padding: isMobile ? 12 : 0 }}>
        <Heading size={tableSize}>SMTP config for invites</Heading>
        <Separator height={24} />
        {!emailConfig?.hasSystemConfig && !emailConfig?.hasCustomConfig ? (
          <Text size={tableSize}>No email config</Text>
        ) : null}
        {emailConfig?.hasSystemConfig && !emailConfig?.hasCustomConfig ? (
          <Text size={tableSize}>Using system config</Text>
        ) : null}
        {emailConfig?.hasCustomConfig ? (
          <Text size={tableSize}>Using custom config</Text>
        ) : null}
        <Separator height={24} />

        {!emailConfig?.hasCustomConfig ? (
          <PrimaryButton
            size={tableSize}
            isSecondary
            onClick={() => openModal(true)}
          >
            Add custom config
          </PrimaryButton>
        ) : null}

        {emailConfig ? (
          <ButtonBase size={tableSize} onClick={() => openModal(true)}>
            View config
          </ButtonBase>
        ) : null}

        <Separator width={16} height={16} />

        {modalOpen ? (
          <EmailConfigModal handleClose={() => openModal(false)} />
        ) : null}

        {emailConfig?.hasCustomConfig ? (
          <>
            <ButtonBase
              size={tableSize}
              isLoading={isLoading}
              onClick={handleDelete}
            >
              Delete config
            </ButtonBase>
          </>
        ) : null}
        <Separator height={24} />
      </Box>
    </>
  );
};

export default EmailConfigSettings;
