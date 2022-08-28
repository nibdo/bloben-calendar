import React, { useContext, useState } from 'react';

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Context } from 'context/store';
import { EvaIcons } from 'components/eva-icons';
import { RRule } from 'rrule';
import { repeatOptions } from './EventDetailRepeatUtils';
import ChakraModal from '../../chakraCustom/ChakraModal';
import FormIcon from '../../formIcon/FormIcon';
import RRuleCustom from '../../rRuleCustom/RRuleCustom';

interface RepeatSelectedValueProps {
  value: string;
}
export const RepeatSelectedValue = (props: RepeatSelectedValueProps) => {
  const { value } = props;

  return (
    <>
      <Text>{value}</Text>
    </>
  );
};

export const renderRepeatOptions = (select: any) => {
  return repeatOptions.map((item: any) => {
    return (
      <MenuItem key={item.value} onClick={() => select(item)}>
        {item.label}
      </MenuItem>
    );
  });
};

interface EventDetailRepeatProps {
  setForm: any;
  isRepeated: boolean;
  form?: any;
  disabledRRule?: boolean;
}
const EventDetailRepeat = (props: EventDetailRepeatProps) => {
  const { setForm, form, disabledRRule } = props;

  const [isCustomOpen, openCustomMenu] = useState(false);

  const [store] = useContext(Context);
  const { isDark } = store;

  const selectOption = (item: any) => {
    if (item.value === 'custom') {
      openCustomMenu(true);
      setForm('isRepeated', true);
      setForm('rRule', 'RRULE:FREQ=WEEKLY;INTERVAL=1');

      return;
    }
    if (item.value === 'none') {
      setForm('isRepeated', false);
      setForm('rRule', '');

      return;
    }
    setForm('isRepeated', true);
    // TODO testing repeat
    // setRRule("freq", item.value);
    setForm('rRule', item.value);
  };

  const selectedValue: any = (
    <RepeatSelectedValue
      value={
        form.rRule !== '' ? RRule.fromString(form.rRule).toText() : 'No repeat'
      }
    />
  );

  const renderedRepeatOptions = renderRepeatOptions(selectOption);

  return disabledRRule ? null : (
    <Stack direction={'row'} align={'center'}>
      <FormIcon allVisible isDark={isDark}>
        <EvaIcons.Refresh className={'EventDetail-icon'} />
      </FormIcon>
      <Menu>
        <MenuButton as={Button} _focus={{ boxShadow: 'none' }}>
          <Text style={{ fontWeight: 'normal' }}>{selectedValue}</Text>
        </MenuButton>
        <MenuList>{renderedRepeatOptions}</MenuList>
      </Menu>
      {isCustomOpen ? (
        <ChakraModal
          handleClose={() => openCustomMenu(false)}
          style={{ zIndex: 99999 }}
        >
          <RRuleCustom setForm={setForm} form={form} />
        </ChakraModal>
      ) : null}
    </Stack>
  );
};

export default EventDetailRepeat;
