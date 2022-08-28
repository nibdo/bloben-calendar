import React, { useContext } from 'react';

import { Button, Stack } from '@chakra-ui/react';
import { Context } from '../../../context/store';
import { EvaIcons } from 'components/eva-icons';
import { LOCATION_PROVIDER } from '../../../bloben-interface/enums';
import { parseEventString } from '../eventDetailNotes/EventDetailNotes';
import ChakraInput from '../../chakraCustom/ChakraInput';
import FormIcon from '../../formIcon/FormIcon';

const parseLink = (link: string, locationProvider: LOCATION_PROVIDER) => {
  if (locationProvider === LOCATION_PROVIDER.GOOGLE_MAPS) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURI(link)}`;
  } else {
    return `https://www.openstreetmap.org/search?query=${encodeURI(link)}`;
  }
};

interface LocationButtonProps {
  location: string;
}
const LocationButton = (props: LocationButtonProps) => {
  const { location } = props;
  const [store] = useContext(Context);
  const { serverSettings } = store;

  return (
    <Button
      variant={'ghost'}
      style={{ fontWeight: 'normal', padding: 0 }}
      justifyContent={'flex-start'}
      onClick={() => {
        window.open(
          parseLink(location, serverSettings.locationProvider),
          '_blank'
        );
      }}
    >
      {parseEventString(location)}
    </Button>
  );
};

interface EventDetailLocationProps {
  handleChange?: any;
  value: string;
  disabled?: boolean;
}
const EventDetailLocation = (props: EventDetailLocationProps) => {
  const { value, handleChange, disabled } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <Stack
      direction={'row'}
      align={'center'}
      style={{
        width: '100%',
      }}
    >
      <FormIcon isDark={isDark} allVisible>
        <EvaIcons.Pin className={'EventDetail-icon'} />
      </FormIcon>
      {disabled ? (
        <LocationButton location={value} />
      ) : (
        <ChakraInput
          size={'md'}
          type="text"
          placeholder="Location"
          name={'location'}
          value={value}
          variant={disabled ? 'unstyled' : 'outline'}
          onChange={handleChange}
          isDisabled={disabled}
          autoComplete={'off'}
        />
      )}
    </Stack>
  );
};

export default EventDetailLocation;
