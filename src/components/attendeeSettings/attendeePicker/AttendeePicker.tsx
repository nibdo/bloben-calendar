import React, { useContext, useEffect, useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import { useSelector } from 'react-redux';

import './AttendeePicker.scss';

import { ScrollView, parseCssDark, SearchHeader } from 'bloben-react';
import { Attendee, Validator } from 'bloben-utils';
import { Context } from 'bloben-module/context/store';
import ContactSync from '../../../sync/ContactSync';

interface OneAttendeeProps {
  item: any;
  handleSelect: any;
  isDark: boolean;
  handleClose: any;
  handleClearSearch: any;
}
const OneAttendee = (props: OneAttendeeProps) => {
  const { isDark, item, handleClose, handleSelect, handleClearSearch } = props;

  const onSelect = () => {
    handleSelect(item.email);
    handleClearSearch();
  };

  return (
    <ButtonBase
      className={parseCssDark('timezone__container', isDark)}
      onClick={onSelect}
    >
      <p className={parseCssDark('timezone__text', isDark)}>{item.email}</p>
    </ButtonBase>
  );
};

interface OneAttendeeSelectedProps {
  item: Attendee;
  isDark: boolean;
}
const OneAttendeeSelected = (props: OneAttendeeSelectedProps) => {
  const { item, isDark } = props;

  return (
    <ButtonBase className={parseCssDark('timezone__container', isDark)}>
      <p className={parseCssDark('timezone__text', isDark)}>{item.mailto}</p>
    </ButtonBase>
  );
};

const renderResults = (
  data: any[],
  handleSelect: any,
  handleClose: any,
  isDark: boolean,
  handleClearSearch: any
) =>
  data.map((item: any) => (
    <OneAttendee
      key={item.email}
      item={item}
      isDark={isDark}
      handleClose={handleClose}
      handleSelect={handleSelect}
      handleClearSearch={handleClearSearch}
    />
  ));

const renderAttendees = (data: any[], isDark: boolean) =>
  data.map((item: Attendee) => (
    <OneAttendeeSelected key={item.mailto} item={item} isDark={isDark} />
  ));

interface AttendeePickerViewProps {
  handleSelect: any;
  onClose: any;
  handleClearSearch: any;
  onSearchInput: any;
  typedText: string;
  results: string[];
  attendees: any;
  clearTypedText: any;
}
const AttendeePickerView = (props: AttendeePickerViewProps) => {
  const [store] = useContext(Context);

  const { isDark, isMobile } = store;

  const {
    onClose,
    handleSelect,
    results,
    handleClearSearch,
    onSearchInput,
    typedText,
    attendees,
    clearTypedText,
  } = props;

  const renderedResults: any = renderResults(
    results,
    handleSelect,
    onClose,
    isDark,
    handleClearSearch
  );
  const renderedAttendees: any = renderAttendees(attendees, isDark);

  const handleSearchSubmit = async () => {
    const isEmail: boolean = Validator.isEmail(typedText);

    if (!isEmail) {
      return;
    }

    await ContactSync.createNewFromSearch(typedText, results);

    handleSelect(typedText);
    clearTypedText();
  };

  return (
    <div className={parseCssDark('column', isDark)}>
      <SearchHeader
        typedText={typedText}
        goBack={onClose}
        handleClearSearch={handleClearSearch}
        onSearchInput={onSearchInput}
        placeholder={'Add people'}
        submitEnter={handleSearchSubmit}
        isMobile={isMobile}
        isDark={isDark}
      />
      <ScrollView isDark={isDark}>
        {typedText.length > 0 ||
        (results.length > 0 && attendees.length === 0 && typedText.length === 0)
          ? renderedResults
          : renderedAttendees}
      </ScrollView>
    </div>
  );
};

interface AttendeePickerProps {
  handleSelect: any;
  onClose: any;
  attendees: any;
  makeOptional: any;
}

const AttendeePicker = (props: AttendeePickerProps) => {
  const { handleSelect, onClose, attendees, makeOptional } = props;

  const contacts: any[] = useSelector((state: any) => state.contacts);

  const [typedText, setTypedText] = useState('');
  const [results, setResults]: any = useState([]);

  const onSearchInput = (event: any) => {
    setTypedText(event.target.value);
  };

  /**
   * Set some contacts on load as search result
   */
  useEffect(() => {
    setResults(contacts);
  }, []);

  const handleClearSearch = () => {
    setTypedText('');
    setResults([]);
  };
  const clearTypedText = () => {
    setTypedText('');
  };

  useEffect(() => {
    if (typedText.length === 0 && attendees.length === 0) {
      setResults(contacts);

      return;
    }

    if (typedText.length < 1) {
      setResults([]);

      return;
    }
    const foundItems: any[] = search(typedText);

    setResults(foundItems);
  }, [typedText]);

  const search = (keyWord: string) => {
    const result: any = [];
    if (keyWord.length >= 3 && contacts.length > 0) {
      for (const item of contacts) {
        if (item.email.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1) {
          result.push(item);
        }
      }
    }

    return result;
  };

  return (
    <AttendeePickerView
      onClose={onClose}
      handleSelect={handleSelect}
      handleClearSearch={handleClearSearch}
      onSearchInput={onSearchInput}
      typedText={typedText}
      results={results}
      attendees={attendees}
      clearTypedText={clearTypedText}
    />
  );
};

export default AttendeePicker;
