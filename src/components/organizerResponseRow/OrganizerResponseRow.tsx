import { ATTENDEE_PARTSTAT } from '../../enums';
import { Button, Stack, useToast } from '@chakra-ui/react';
import { SOURCE_TYPE } from '../../bloben-interface/enums';
import { TOAST_STATUS } from '../../types/enums';
import { createToast } from '../../utils/common';
import { find } from 'lodash';
import CalDavEventsApi from '../../api/CalDavEventsApi';
import React, { useState } from 'react';
import SendInviteModal from '../sendInviteModalModal/SendInviteModal';

interface OrganizerResponseRowProps {
  event: any;
  handleClose: any;
}
const OrganizerResponseRow = (props: OrganizerResponseRowProps) => {
  const { event, handleClose } = props;
  const toast = useToast();
  const [emailInviteModalVisible, openEmailInviteModal] = useState<any>(null);

  const organizer = find(
    event?.attendees,
    (item) => item?.mailto === event?.organizer?.mailto
  );

  const partStat: ATTENDEE_PARTSTAT | undefined = organizer?.PARTSTAT;

  const updateStatus = async (eventID: string, data: any) => {
    if (partStat === data.status) {
      return;
    }

    try {
      const response = await CalDavEventsApi.updateStatus(eventID, data);

      if (response.data?.message) {
        toast(createToast(response.data.message));
      }

      handleClose();
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }
  };

  const handleClick = async (status: ATTENDEE_PARTSTAT) => {
    openEmailInviteModal({
      call: async (sendInvite?: boolean, inviteMessage?: string) => {
        await updateStatus(event.id, { status, sendInvite, inviteMessage });
      },
    });
  };

  const disabled = event.sourceType === SOURCE_TYPE.WEBCAL;

  return organizer ? (
    <Stack
      direction={'row'}
      spacing={3}
      justifyContent={'flex-end'}
      style={{ marginTop: 16 }}
    >
      <Button
        variant={partStat === ATTENDEE_PARTSTAT.ACCEPTED ? 'solid' : 'ghost'}
        colorScheme={partStat === ATTENDEE_PARTSTAT.ACCEPTED ? 'pink' : 'gray'}
        onClick={() => handleClick(ATTENDEE_PARTSTAT.ACCEPTED)}
        disabled={disabled}
      >
        Going
      </Button>
      <Button
        variant={partStat === ATTENDEE_PARTSTAT.TENTATIVE ? 'solid' : 'ghost'}
        colorScheme={partStat === ATTENDEE_PARTSTAT.TENTATIVE ? 'pink' : 'gray'}
        onClick={() => handleClick(ATTENDEE_PARTSTAT.TENTATIVE)}
        disabled={disabled}
      >
        Maybe
      </Button>
      <Button
        variant={partStat === ATTENDEE_PARTSTAT.DECLINED ? 'solid' : 'ghost'}
        colorScheme={partStat === ATTENDEE_PARTSTAT.DECLINED ? 'pink' : 'gray'}
        onClick={() => handleClick(ATTENDEE_PARTSTAT.DECLINED)}
        disabled={disabled}
      >
        No
      </Button>
      {emailInviteModalVisible ? (
        <SendInviteModal
          handleClose={handleClose}
          clickData={emailInviteModalVisible}
        />
      ) : null}
    </Stack>
  ) : null;
};

export default OrganizerResponseRow;
