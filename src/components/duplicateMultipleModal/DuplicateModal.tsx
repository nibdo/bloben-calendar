import { Center, useToast } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { EventResult } from '../../bloben-interface';
import { PrimaryButton, Separator } from 'bloben-components';
import { TOAST_STATUS } from '../../types/enums';
import { createToast } from '../../utils/common';
import { filter, map } from 'lodash';
import CalDavEventsApi from '../../api/CalDavEventsApi';
import DatePicker from '../datePicker/DatePicker';
import ModalNew from '../../components/modalNew/ModalNew';
import React, { useState } from 'react';
import SendInviteModal from '../sendInviteModalModal/SendInviteModal';

const formatWarningMessage = (
  selectedDays: string[],
  attendees: any[] | undefined | null
) => {
  if (!attendees || attendees.length < 1) {
    return undefined;
  }

  const attendeesLength = attendees?.length - 1;

  const emailCount = attendeesLength * selectedDays.length;

  return `Will send 
                  ${emailCount} email invite${emailCount > 1 ? 's' : ''}`;
};

interface DuplicateMultipleModalProps {
  handleClose: any;
  event: EventResult;
}
const DuplicateMultipleModal = (props: DuplicateMultipleModalProps) => {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [emailInviteModalVisible, openEmailInviteModal] = useState<any>(false);

  const { handleClose, event } = props;

  const closeFunc = () => {
    openEmailInviteModal(false);

    if (!isLoading) {
      handleClose();
    }
  };

  const handleSelectDate = (date: DateTime) => {
    const dateString = date.toString();
    let copyDays = [...selectedDays];

    if (copyDays.includes(dateString)) {
      copyDays = filter(copyDays, (item) => item !== dateString);
    } else {
      copyDays.push(dateString);
    }

    setSelectedDays(copyDays);
  };

  const handleClick = () => {
    if (event.attendees?.length) {
      openEmailInviteModal({
        call: async (sendInvite?: boolean, inviteMessage?: string) => {
          await handleSave(sendInvite, inviteMessage);
        },
      });
    } else {
      handleSave();
    }
  };

  const handleSave = async (sendInvite?: boolean, inviteMessage?: string) => {
    setIsLoading(true);

    try {
      const response = await CalDavEventsApi.duplicateMultiple(event.id, {
        dates: map(selectedDays, (item) =>
          DateTime.fromISO(item).toFormat('dd-MM-yyyy')
        ),
        sendInvite,
        inviteMessage,
      });

      setIsLoading(false);

      if (response.data) {
        toast(createToast(response?.data?.message));

        closeFunc();
      }
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
      setIsLoading(false);
    }
  };

  return (
    <ModalNew
      handleClose={closeFunc}
      title={'Select days for duplicates'}
      closeButton={true}
      preventCloseOnBackdrop={true}
    >
      <>
        <DatePicker
          width={250}
          sideMargin={6}
          selectDate={handleSelectDate}
          selectedDate={null}
          selectedDates={selectedDays}
          withInput={false}
        />
        <Separator height={15} />
        <Center>
          <PrimaryButton
            isLoading={isLoading}
            onClick={handleClick}
            disabled={!selectedDays.length}
          >
            Save
          </PrimaryButton>
        </Center>
      </>
      {emailInviteModalVisible ? (
        <SendInviteModal
          handleClose={handleClose}
          clickData={emailInviteModalVisible}
          warningText={formatWarningMessage(selectedDays, event.attendees)}
        />
      ) : null}
    </ModalNew>
  );
};

export default DuplicateMultipleModal;
