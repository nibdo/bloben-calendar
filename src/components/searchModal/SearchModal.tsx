import React, { useContext, useState } from 'react';

import './SearchModal.scss';
import { Button, Text, useToast } from '@chakra-ui/react';
import { ChakraInput } from 'bloben-components';
import { Context, StoreContext } from '../../context/store';
import { ReduxState } from '../../types/interface';
import { SearchEventsResponse } from '../../bloben-interface';
import { TOAST_STATUS } from '../../types/enums';
import {
  createToast,
  formatEventDate,
  getLocalTimezone,
  parseCssDark,
} from '../../utils/common';
import { useSelector } from 'react-redux';
import EventsApi from '../../api/EventsApi';
import PublicApi from '../../api/PublicApi';

interface SearchItemProps {
  item: SearchEventsResponse;
  onClick: any;
}
const SearchItem = (props: SearchItemProps) => {
  const { item, onClick } = props;

  const settings = useSelector((state: ReduxState) => state.calendarSettings);
  const timezone = settings.timezone || getLocalTimezone();

  const eventDate = formatEventDate(item, timezone);

  return (
    <Button
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: '4px 8px 4px 8px',
        background: 'transparent',
        marginBottom: 4,
        borderBottom: 'solid 0.4px #E2E8F0',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
      }}
      onClick={() => onClick(item)}
    >
      <div
        style={{
          width: '50%',
          display: 'flex',
          justifyContent: 'flex-start',
          overflow: 'hidden',
        }}
      >
        <Text>{item.summary}</Text>
      </div>
      <div
        style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}
      >
        <Text style={{ fontWeight: 'normal' }}>
          {eventDate.dates} at {eventDate.time}
        </Text>
      </div>
    </Button>
  );
};

interface SearchModalProps {
  handleClose: any;
  handleClick: any;
  sharedCalendarID?: string;
}
const SearchModal = (props: SearchModalProps) => {
  const toast = useToast();

  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchEventsResponse[]>([]);
  const [store]: [StoreContext] = useContext(Context);
  const { isDark } = store;

  const { handleClose, handleClick, sharedCalendarID } = props;

  const onChange = (e: any) => {
    setSearchText(e.target.value);

    if (e.target.value.length > 2) {
      handleSearch(e.target.value);
    }
  };

  const preventDefault = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSearch = async (value: string) => {
    try {
      if (value.length < 3) {
        return;
      }

      let response;

      if (sharedCalendarID) {
        response = await PublicApi.searchPublicEvents(sharedCalendarID, value);
      } else {
        response = await EventsApi.searchEvents(value);
      }

      if (response?.data?.length) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }
  };

  const onClick = (item: SearchEventsResponse) => {
    handleClick(item.id, item.type, store.isDark);
  };

  return (
    <div
      className={parseCssDark('SearchModal__wrapper', isDark)}
      onClick={handleClose}
    >
      <div
        className={parseCssDark('SearchModal__header', isDark)}
        onClick={preventDefault}
      >
        <div className={'SearchModal__input'}>
          <ChakraInput
            size={'lg'}
            id="searchText"
            type="text"
            name={'searchText'}
            placeholder={'Search'}
            onChange={onChange}
            autoFocus={true}
            autoComplete={'off'}
            value={searchText}
          />
        </div>
      </div>
      {results.length ? (
        <div
          className={parseCssDark('SearchModal__container', isDark)}
          onClick={preventDefault}
        >
          {results.map((item) => (
            <SearchItem key={item.id} item={item} onClick={onClick} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchModal;
