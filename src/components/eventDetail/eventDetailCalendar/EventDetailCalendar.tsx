import '../EventDetail.scss';

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CalDavCalendar, ReduxState } from '../../../types/interface';
import { Context } from '../../../context/store';
import { EvaIcons } from 'components/eva-icons';
import { colors } from '../../../utils/colors';
import { useSelector } from 'react-redux';
import CircleFill from '../../eva-icons/circle-fill';
import FormIcon from '../../formIcon/FormIcon';
import React, { useContext } from 'react';
import Separator from '../../separator/Separator';

const renderCalendars = (data: CalDavCalendar[], selectCalendar: any) => {
  return data.map((item) => {
    return (
      <MenuItem onClick={() => selectCalendar(item)} key={item.url}>
        {item.displayName || 'Unknown' + ' name'}
      </MenuItem>
    );
  });
};

interface EventDetailCalendarProps {
  calendar: any;
  selectCalendar?: any;
  disabled?: boolean;
  color?: string;
  setForm?: any;
}
const EventDetailCalendar = (props: EventDetailCalendarProps) => {
  const { calendar, selectCalendar, disabled } = props;

  const calendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const [store] = useContext(Context);
  const { isDark } = store;

  const renderedCalendar = renderCalendars(calendars, selectCalendar);

  return (
    <Stack direction={'row'} align={'center'}>
      <FormIcon desktopVisible isDark={isDark}>
        <EvaIcons.Calendar className={'EventDetail-icon'} />
      </FormIcon>
      <Menu isLazy>
        <MenuButton
          size={'md'}
          style={{
            background: props.color || calendar.customColor || calendar.color,
          }}
          as={Button}
        >
          {' '}
        </MenuButton>
        {disabled ? null : (
          <MenuList
            style={{
              maxHeight: 120,
              overflowX: 'hidden',
              overflowY: 'scroll',
            }}
          >
            {colors.map((item) => {
              return (
                <MenuItem
                  key={item}
                  onClick={() => props.setForm('color', item)}
                >
                  <CircleFill fill={item} />
                  <Separator width={8} />
                  {item}
                </MenuItem>
              );
            })}
          </MenuList>
        )}
      </Menu>
      {disabled ? (
        <Text style={{ fontWeight: 'normal' }}>{calendar.displayName}</Text>
      ) : (
        <Menu>
          <MenuButton as={Button} _focus={{ boxShadow: 'none' }}>
            <Text style={{ fontWeight: 'normal' }}>{calendar.displayName}</Text>
          </MenuButton>
          <MenuList>{renderedCalendar}</MenuList>
        </Menu>
      )}
    </Stack>
  );
};

export default EventDetailCalendar;
