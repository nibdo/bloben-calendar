import React, { useContext } from 'react';

import { ChakraInput, EvaIcons } from 'bloben-components';
import { Context, StoreContext } from '../../../context/store';
import { Stack, Text } from '@chakra-ui/react';
import { parseEventString } from '../eventDetailNotes/EventDetailNotes';
import FormIcon from '../../formIcon/FormIcon';

interface EventDetailTitleProps {
  isNewEvent: boolean;
  value: string;
  handleChange?: any;
  disabled?: boolean;
  placeholder?: string;
}
const EventDetailTitle = (props: EventDetailTitleProps) => {
  const { isNewEvent, value, handleChange, disabled, placeholder } = props;

  const [store]: [StoreContext] = useContext(Context);
  const { isDark } = store;

  return (
    <Stack direction={'row'} align={'center'} style={{ width: '100%' }}>
      <FormIcon isDark={isDark} hidden allVisible>
        <EvaIcons.Note color={'transparent'} fill={'transparent'} />
      </FormIcon>
      {disabled ? (
        <Text size={'md'} fontWeight={'bold'}>
          {parseEventString(value)}
        </Text>
      ) : (
        <ChakraInput
          size={'md'}
          type="text"
          placeholder={placeholder || 'Event title'}
          name={'summary'}
          value={value}
          variant={disabled ? 'unstyled' : 'outline'}
          fontWeight={'bold'}
          onChange={handleChange}
          readOnly={disabled}
          autoFocus={isNewEvent}
          autoComplete={'off'}
          style={{ width: '95%' }}
        />
      )}
    </Stack>
    // <FormContainer>
    //   <FormRow>
    //     <FormInputWrapper>
    //       <FormIcon isDark={isDark} hidden allVisible>
    //         <EvaIcons.Calendar />
    //       </FormIcon>
    //       <FormInput
    //         isDark={isDark}
    //         autoFocus={isNewEvent}
    //         value={value}
    //         type={'big'}
    //         name={'summary'}
    //         multiline={true}
    //         placeholder={'New event'}
    //         handleChange={handleChange}
    //         disabled={disabled}
    //         transparent
    //       />
    //     </FormInputWrapper>
    //   </FormRow>
    // </FormContainer>
  );
};

export default EventDetailTitle;
