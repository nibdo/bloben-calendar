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
import { CALDAV_COMPONENTS, EVENT_TYPE } from '../../../bloben-interface/enums';
import { CalDavCalendar, ReduxState } from '../../../types/interface';
import { Context, StoreContext } from '../../../context/store';
import { EvaIcons, Separator } from 'bloben-components';
import { colors } from '../../../utils/colors';
import { filter } from 'lodash';
import { useSelector } from 'react-redux';
import FormIcon from '../../formIcon/FormIcon';
import React, { useContext } from 'react';

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
  type: EVENT_TYPE;
}
const EventDetailCalendar = (props: EventDetailCalendarProps) => {
  const { calendar, selectCalendar, disabled, type = EVENT_TYPE.EVENT } = props;

  const calendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const [store]: [StoreContext] = useContext(Context);
  const { isDark } = store;

  const calendarsFiltered = filter(calendars, (calendar) =>
    calendar.components.includes(
      type === EVENT_TYPE.EVENT
        ? CALDAV_COMPONENTS.VEVENT
        : CALDAV_COMPONENTS.VTODO
    )
  );

  const renderedCalendar = renderCalendars(calendarsFiltered, selectCalendar);

  return (
    <Stack direction={'row'} align={'center'}>
      <FormIcon allVisible isDark={isDark}>
        {disabled ? (
          <EvaIcons.CircleFill
            style={{
              fill: props.color || calendar.customColor || calendar.color,
              filter: isDark ? 'saturate(60%) brightness(120%)' : '',
            }}
          />
        ) : (
          <EvaIcons.Calendar className={'EventDetail-icon'} />
        )}
      </FormIcon>
      {disabled ? null : (
        <Menu isLazy>
          <MenuButton size={'md'} as={Button}>
            <EvaIcons.CircleFill
              style={{
                fill: props.color || calendar.customColor || calendar.color,
                filter: isDark ? 'saturate(60%) brightness(120%)' : '',
              }}
            />
          </MenuButton>
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
                  <EvaIcons.CircleFill
                    style={{
                      fill: item,
                      filter: isDark ? 'saturate(60%) brightness(120%)' : '',
                    }}
                  />
                  <Separator width={8} />
                  {item}
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>
      )}
      {disabled ? (
        <Text
          style={{
            fontWeight: 'normal',
          }}
        >
          {calendar.displayName}
        </Text>
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
