import React, { useContext } from 'react';

import { Context } from '../../../context/store';
import { EvaIcons } from 'components/eva-icons';
import { Stack } from '@chakra-ui/react';
import { map } from 'lodash';
import { parseHtml } from '../../../utils/parserHtml';
import ChakraTextArea from '../../chakraCustom/ChakraTextArea';
import FormIcon from '../../formIcon/FormIcon';
import ResizeTextarea from 'react-textarea-autosize';

export const parseEventString = (value: string) => {
  let newValueString = value;
  let newValue;

  if (newValueString.indexOf('\\n') !== -1) {
    newValueString = newValueString.replace(/\\n/g, '\n');
  }

  if (newValueString.indexOf('\\;') !== -1) {
    newValueString = newValueString.replaceAll(/\\;/g, ';');
  }
  if (newValueString.indexOf('\\,') !== -1) {
    newValueString = newValueString.replaceAll(/\\,/g, ',');
  }

  if (newValueString.indexOf('\\n') !== -1) {
    newValue = map(newValueString.split('\\n'), (item) => <p>{item}</p>);

    return newValue;
  }

  return <p>{newValueString}</p>;
};

const parseEventStringToHtml = (value: string) => {
  let newValueString = value;

  if (newValueString.indexOf('\\n') !== -1) {
    newValueString = newValueString.replaceAll('\\n', '<br>');
  }
  if (newValueString.indexOf('\n') !== -1) {
    newValueString = newValueString.replaceAll('\n', '<br>');
  }

  if (newValueString.indexOf('\\;') !== -1) {
    newValueString = newValueString.replaceAll('\\;', ';');
  }
  if (newValueString.indexOf('\\,') !== -1) {
    newValueString = newValueString.replaceAll('\\,', ',');
  }

  return newValueString;
};

interface EventDetailNotesProps {
  handleChange?: any;
  value: string;
  disabled?: boolean;
}
const EventDetailNotes = (props: EventDetailNotesProps) => {
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
      <FormIcon isDark={isDark} allVisible alignTop>
        <EvaIcons.Document className={'EventDetail-icon'} />
      </FormIcon>
      {disabled ? (
        <p
          dangerouslySetInnerHTML={{
            __html: parseHtml(parseEventStringToHtml(value)),
          }}
        />
      ) : (
        <ChakraTextArea
          size={'md'}
          placeholder="Notes"
          name={'description'}
          value={value}
          variant={disabled ? 'unstyled' : 'outline'}
          onChange={handleChange}
          isDisabled={disabled}
          autoComplete={'off'}
          minRows={1}
          rows={1}
          maxRows={5}
          as={ResizeTextarea}
        />
      )}
    </Stack>
  );
};

export default EventDetailNotes;
