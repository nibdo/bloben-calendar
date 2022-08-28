import React, { useContext, useEffect, useRef, useState } from 'react';

import './EventDetailAttendee.scss';
import {
  Attendee,
  PARTSTAT_ACCEPTED,
  PARTSTAT_DECLINED,
  PARTSTAT_NEED_ACTION,
  PARTSTAT_TENTATIVE,
  createAttendee,
} from '../../../utils/AttendeeUtils';
import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Context } from '../../../context/store';
import { EvaIcons } from 'components/eva-icons';
import { SearchCardDavContactResponse } from '../../../bloben-interface/cardDavContact/cardDavContact';
import { TOAST_STATUS } from '../../../types/enums';
import { createToast, parseCssDark } from '../../../utils/common';
import { filter, map } from 'lodash';
import CardDavContactApi from '../../../api/CardDavContactApi';
import ChakraInput from 'components/chakraCustom/ChakraInput';
import FormIcon from '../../formIcon/FormIcon';
import OrganizerResponseRow from '../../organizerResponseRow/OrganizerResponseRow';
import TrashIcon from '../../eva-icons/trash';
import Validator from '../../../utils/Validator';

const SearchResult = (props: {
  data: SearchCardDavContactResponse[];
  attendeesSelected: Attendee[];
  isDark: boolean;
  inputRef: any;
  handleSubmit: any;
  handleClose: any;
}) => {
  const { data, attendeesSelected, handleSubmit, handleClose, isDark } = props;

  const emailsUsed = map(attendeesSelected, 'mailto');
  const searchFiltered = filter(data, (item: any) => {
    if (!emailsUsed.includes(item.email)) {
      return item;
    }
  });

  const element = document
    .querySelector('.AttendeeInput')
    ?.getBoundingClientRect();

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
      }}
      onClick={handleClose}
    >
      <div
        className={parseCssDark('EventDetailAttendee__searchContainer', isDark)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          top: 40 + (element?.top || 0),
          left: element?.left,
        }}
      >
        {map(searchFiltered, (item: SearchCardDavContactResponse) => {
          return (
            <div
              className={'EventDetailAttendee__searchItem'}
              key={`${item.id}${item.email}`}
            >
              <Button
                _focus={{ boxShadow: 'none' }}
                style={{ width: '100%', justifyContent: 'flex-start' }}
                variant={'ghost'}
                onClick={() =>
                  handleSubmit({ target: { value: item.email } }, true)
                }
              >
                <Text style={{ fontWeight: 'normal' }}>{item.email}</Text>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PartstatIcon = (props: { attendee: Attendee }) => {
  return (
    <>
      {props.attendee.PARTSTAT === PARTSTAT_ACCEPTED ? (
        <EvaIcons.Check
          className={'AttendeePartstatIcon'}
          fill={'green'}
          style={{ marginRight: 2 }}
        />
      ) : null}
      {props.attendee.PARTSTAT === PARTSTAT_TENTATIVE ||
      props.attendee.PARTSTAT === PARTSTAT_NEED_ACTION ? (
        <EvaIcons.QuestionCircle
          className={'AttendeePartstatIcon'}
          fill={'gray'}
          style={{ marginRight: 2 }}
        />
      ) : null}
      {props.attendee.PARTSTAT === PARTSTAT_DECLINED ? (
        <EvaIcons.Cross
          className={'AttendeePartstatIcon'}
          fill={'red'}
          style={{ marginRight: 2 }}
        />
      ) : null}
    </>
  );
};

const renderAttendees = (
  attendees: Attendee[],
  removeAttendee: any,
  updateAttendee: any,
  disabled?: boolean
) => {
  return attendees.map((item) => {
    return (
      <Flex
        key={item?.mailto}
        direction={'row'}
        paddingLeft={2}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <PartstatIcon attendee={item} />
        <Text>{item.mailto}</Text>
        <Spacer />
        {disabled ? null : (
          <Menu closeOnSelect>
            <MenuButton
              as={Button}
              style={{ height: 'auto', marginRight: 4 }}
              size={'xs'}
              _focus={{ boxShadow: 'none' }}
            >
              {item?.ROLE
                ? item?.ROLE?.slice(0, item?.ROLE?.indexOf('-'))
                : item?.ROLE}
            </MenuButton>
            <MenuList>
              <Stack spacing={1}>
                <MenuItem
                  onClick={() => {
                    updateAttendee({
                      ...item,
                      ROLE: 'REQ-PARTICIPANT',
                    });
                  }}
                >
                  REQ
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    updateAttendee({
                      ...item,
                      ROLE: 'OPT-PARTICIPANT',
                    });
                  }}
                >
                  OPT
                </MenuItem>
              </Stack>
            </MenuList>
          </Menu>
        )}
        {disabled ? null : (
          <IconButton
            _focus={{ boxShadow: 'none' }}
            variant={'ghost'}
            aria-label="Menu"
            background={'transparent'}
            icon={<TrashIcon className={'AttendeeIcon'} />}
            isRound
            size={'xs'}
            autoFocus={false}
            onClick={() => removeAttendee(item)}
          />
        )}
      </Flex>
    );
  });
};

interface EventDetailAttendeeProps {
  addAttendee?: any;
  removeAttendee?: any;
  updateAttendee?: any;
  attendees: Attendee[];
  disabled?: boolean;
  disabledAttendeeChange?: boolean;
  event?: any;
  handleClose?: any;
}
const EventDetailAttendee = (props: EventDetailAttendeeProps) => {
  const toast = useToast();

  const inputRef = useRef(null);
  const [isListVisible, setListVisible] = useState(false);
  const [attendee, setAttendee] = useState<string>('');
  const [isInFocus, setIsInFocus] = useState(false);

  const {
    disabled,
    disabledAttendeeChange,
    addAttendee,
    removeAttendee,
    updateAttendee,
    attendees,
    event,
    handleClose,
  } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  const [searchResult, setSearchResult] = useState<any>([]);

  const onChange = async (e: any) => {
    const value = e.target.value;
    setAttendee(value);
    setIsInFocus(true);

    if (value.length >= 0) {
      try {
        const searchResponse = await CardDavContactApi.search(value);

        if (searchResponse.data) {
          setSearchResult(searchResponse.data);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    }
  };

  const handleSubmit = (e: any, isClick?: boolean) => {
    onChange(e);

    if (e.keyCode === 13 || e.which === 13 || isClick) {
      // @ts-ignore
      inputRef?.current?.blur();

      const isEmail = Validator.isEmail(e.target.value);

      if (!isEmail) {
        toast(
          createToast(
            `"${e.target.value}" is not valid email`,
            TOAST_STATUS.ERROR
          )
        );
        return;
      }

      const newAttendee = createAttendee({
        email: e.target.value,
        name: e.target.value,
      });
      addAttendee(newAttendee);
      setAttendee('');
      handleSearch();

      if (attendees.length < 2 && !isListVisible) {
        setListVisible(true);
      }
    }

    handleCloseDropdown();
  };

  const renderedAttendees = renderAttendees(
    attendees,
    removeAttendee,
    updateAttendee,
    disabled || disabledAttendeeChange
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFocus = async () => {
    try {
      const searchResponse = await CardDavContactApi.search('');

      if (searchResponse.data) {
        setSearchResult(searchResponse.data);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  };

  const handleSearch = async () => {
    try {
      const searchResponse = await CardDavContactApi.search('');

      if (searchResponse.data) {
        setSearchResult(searchResponse.data);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleCloseDropdown = () => setIsInFocus(false);

  return (disabled || disabledAttendeeChange) && !attendees?.length ? null : (
    <Flex
      direction={'column'}
      style={{
        width: '100%',
      }}
    >
      <Stack
        direction={'row'}
        align={disabled || disabledAttendeeChange ? 'flex-start' : 'center'}
      >
        <FormIcon
          isDark={isDark}
          allVisible
          style={{ paddingTop: disabled || disabledAttendeeChange ? 4 : 0 }}
        >
          <EvaIcons.Person className={'EventDetail-icon'} />
        </FormIcon>
        {!disabled && !disabledAttendeeChange ? (
          <div className={'EventDetailAttendee__input'}>
            <ChakraInput
              ref={inputRef}
              className={'AttendeeInput'}
              size={'md'}
              type="text"
              placeholder="Add attendee"
              name={'attendee'}
              value={attendee}
              variant={disabled ? 'unstyled' : 'outline'}
              onChange={onChange}
              isDisabled={disabled}
              autoComplete={'off'}
              onKeyPress={handleSubmit}
              onFocus={() => setIsInFocus(true)}
              // onBlur={() => setIsInFocus(false)}
            />
            {isInFocus && searchResult?.length ? (
              <SearchResult
                attendeesSelected={attendees}
                data={searchResult}
                isDark={isDark}
                inputRef={inputRef}
                handleSubmit={handleSubmit}
                handleClose={handleCloseDropdown}
              />
            ) : null}
          </div>
        ) : attendees.length ? (
          <Stack
            direction={'column'}
            spacing={2}
            style={{
              width: '100%',
              alignItems: 'flex-start',
              marginTop: 8,
            }}
          >
            <Button
              _focus={{ boxShadow: 'none' }}
              style={{ height: 40, fontWeight: 'normal', padding: 0 }}
              variant={disabled ? 'ghost' : undefined}
              width={'100%'}
              justifyContent={'flex-start'}
              onClick={() => setListVisible(!isListVisible)}
            >
              <Text style={{ fontWeight: 'normal' }}>
                {attendees.length} attendees
              </Text>
            </Button>
            {isListVisible ? renderedAttendees : null}
          </Stack>
        ) : null}
      </Stack>
      {!disabled && attendees.length && !disabledAttendeeChange ? (
        <Stack direction={'row'} align={'center'} style={{ marginBottom: 4 }}>
          <FormIcon isDark={isDark} allVisible hidden>
            <EvaIcons.Person className={'EventDetail-icon'} />
          </FormIcon>
          <Stack
            direction={'column'}
            spacing={2}
            style={{ width: '100%', marginTop: 4, marginBottom: 4 }}
          >
            <Button
              _focus={{ boxShadow: 'none' }}
              style={{ height: 40 }}
              width={'100%'}
              justifyContent={'flex-start'}
              onClick={() => setListVisible(!isListVisible)}
            >
              <Text style={{ fontWeight: 'normal' }}>
                {attendees.length} attendees
              </Text>
            </Button>
            {isListVisible ? renderedAttendees : null}
          </Stack>
        </Stack>
      ) : null}
      {disabled && !disabledAttendeeChange ? (
        <OrganizerResponseRow event={event} handleClose={handleClose} />
      ) : null}
    </Flex>
  );
};

export default EventDetailAttendee;
