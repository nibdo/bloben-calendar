import { ACCOUNT_TYPE } from 'types/enums';
import { Button, Center } from '@chakra-ui/react';

import { Context } from '../../../context/store';
import AccountSelectionModal from 'components/accountSelectionModal/AccountSelectionModal';
import CalDavAccountModal from '../../../components/accountSelectionModal/calDavAccountModal/CalDavAccountModal';
import CalDavAccountSettings from './accountSettings/CalDavAccountSettings';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import React, { useContext, useState } from 'react';
import Separator from '../../../components/separator/Separator';
import WebcalAccountSettings from './accountSettings/WebcalAccountSettings';
import WebcalModal from '../../../components/accountSelectionModal/webcalModal/WebcalModal';

const AccountSettings = () => {
  const [store] = useContext(Context);
  const { isMobile } = store;

  const [newAccountModalOpen, openNewAccountModal] =
    useState<ACCOUNT_TYPE | null>(null);

  const [isSelectionModalOpen, openSelectionModal] = useState(false);

  const handleOpenNewAccountModal = (type: ACCOUNT_TYPE) => {
    openSelectionModal(false);
    openNewAccountModal(type);
  };
  const handleCloseAccountTypeModal = () => {
    openNewAccountModal(null);
  };

  return (
    <>
      {isMobile ? <MobilePageHeader title={'Accounts'} /> : null}
      <Center>
        <Button
          _focus={{ boxShadow: 'none' }}
          onClick={() => openSelectionModal(true)}
          fontSize={14}
        >
          Add account
        </Button>
      </Center>
      <Separator height={20} />
      <CalDavAccountSettings />
      <Separator height={20} />
      <WebcalAccountSettings />

      {isSelectionModalOpen ? (
        <AccountSelectionModal
          isOpen={isSelectionModalOpen}
          handleClose={() => openSelectionModal(false)}
          handleOpenNewAccountModal={handleOpenNewAccountModal}
        />
      ) : null}

      {newAccountModalOpen && newAccountModalOpen === ACCOUNT_TYPE.CAL_DAV ? (
        <CalDavAccountModal handleClose={handleCloseAccountTypeModal} />
      ) : null}
      {newAccountModalOpen && newAccountModalOpen === ACCOUNT_TYPE.WEBCAL ? (
        <WebcalModal handleClose={handleCloseAccountTypeModal} />
      ) : null}
    </>
  );
};

export default AccountSettings;
