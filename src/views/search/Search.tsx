import React, { useContext, useEffect, useState } from 'react';
import './Search.scss';
import IconButton from '@material-ui/core/IconButton';
import EvaIcons from '../../bloben-common/components/eva-icons';
import { useSelector } from 'react-redux';
import { mapEventsToDates } from '../../utils/common';
import { formatTimestampToDate } from '../../components/calendarView/calendar-common';
import { renderAgendaEvents } from '../../components/calendarView/agenda/Agenda';
import { HeightHook } from '../../bloben-common/utils/layout';
import {
  sendWebsocketMessage,
  WEBSOCKET_GET_ALL_EVENTS,
} from '../../api/calendar';
import { Input } from '../../bloben-package/components/input/Input';
import { Context } from '../../bloben-package/context/store';
import { useHistory } from 'react-router-dom';
import { parseCssDark } from '../../bloben-common/utils/common';

const SearchImage = () => (
  <div className={'search_empty__wrapper'}>
    <p className={'search_empty__text'}>No result</p>
  </div>
);

interface IResultsProps {
  results: any;
}
const Results = (props: IResultsProps) => {
  const { results } = props;

  const [store] = useContext(Context);

  const {isDark} = store;

  const height: number = HeightHook() - 56;

  const emptyFunc: any = () => {};

  const renderedResults: any = renderAgendaEvents(
    results,
    isDark,
    emptyFunc,
    emptyFunc
  );

  return (
    <div className={'search__container-results'} style={{ height }}>
      {renderedResults}
    </div>
  );
};

interface ISearchInputProps {
  typedText: string;
  onChange: any;
}
const SearchInput = (props: ISearchInputProps) => {
  const { typedText, onChange } = props;

  const [store] = useContext(Context);

  const {isMobile, isDark} = store;

  return (
    <div className={'search__input-wrapper'}>
      <Input
        className={`search__input${isDark ? '-dark' : ''}`}
        placeholder={'Search'}
        autoFocus={isMobile}
        name={'name'}
        autoComplete={'off'}
        value={typedText}
        onChange={onChange}
        multiline={false}
      />
    </div>
  );
};

interface ISearchHeaderProps {
  typedText: string;
  onSearchInput: any;
  handleClearSearch: any;
}
const SearchHeader = (props: ISearchHeaderProps) => {
  const { typedText, onSearchInput, handleClearSearch } = props;

  const history: any = useHistory();
  const [store] = useContext(Context);

  const {isMobile, isDark} = store;

  const goBack: any = () => history.goBack();

  return (
    <div className={parseCssDark('search__header-container', isDark)}>
      <IconButton
        onClick={goBack}
        className={`${isMobile ? '' : 'small-icon-button'}`}
      >
        <EvaIcons.ArrowBack
          className={`icon-svg${isDark ? '-dark' : ''} ${
            !isMobile ? 'small-svg' : ''
          }`}
        />
      </IconButton>
      <SearchInput typedText={typedText} onChange={onSearchInput} />
      {typedText ? (
        <IconButton
          onClick={handleClearSearch}
          className={`${isMobile ? '' : 'small-icon-button'}`}
        >
          <EvaIcons.Cross
            className={`icon-svg${isDark ? '-dark' : ''} ${
              !isMobile ? 'small-svg' : ''
            }`}
          />
        </IconButton>
      ) : (
        <IconButton
          disabled={true}
          className={`${isMobile ? '' : 'small-icon-button'}`}
        >
          <EvaIcons.Search
            className={`icon-svg${isDark ? '-dark' : ''} ${
              !isMobile ? 'small-svg' : ''
            }`}
          />
        </IconButton>
      )}
    </div>
  );
};

interface IMobileViewProps {
  results: any;
}
const MobileView = (props: IMobileViewProps) => {
  const { results } = props;

  const length: number = Object.keys(results).length;

  return length > 0 ? <Results results={results} /> : <SearchImage />;
};
interface IDesktopViewProps {
  results: any;
}
const DesktopView = (props: IDesktopViewProps) => {
  const { results } = props;

  return results.length > 0 ? (
    <Results results={results} />
  ) : null;
};

interface ISearchViewProps {
  typedText: string;
  results: any;
  onSearchInput: any;
  handleClearSearch: any;
}
const SearchView = (props: ISearchViewProps) => {
  const {
    typedText,
    results,
    onSearchInput,
    handleClearSearch,
  } = props;

  const [store] = useContext(Context);

  const {isMobile} = store;

  return (
    <div className={'search__wrapper'}>
      <SearchHeader
        typedText={typedText}
        onSearchInput={onSearchInput}
        handleClearSearch={handleClearSearch}
      />

      {isMobile ? (
        <MobileView results={results} />
      ) : (
        <DesktopView results={results} />
      )}
    </div>
  );
};

const Search = () => {
  const allEvents: any = useSelector((state: any) => state.allEvents);
  const eventsLastSynced: Date = useSelector(
    (state: any) => state.eventsLastSynced
  );

  const [typedText, setTypedText] = useState('');
  const [results, setResults]: any = useState([]);
  const [mappedEvents, setMappedEvents] = useState({});

  useEffect(() => {
    const result: any = mapEventsToDates(allEvents);

    if (result) {
      setMappedEvents(result);
    }
  },        [allEvents.toString()]);

  /**
   * Get changes in allEvents on mount
   */
  useEffect(() => {
    sendWebsocketMessage(WEBSOCKET_GET_ALL_EVENTS, {
      lastSync: eventsLastSynced ? eventsLastSynced.toISOString() : null,
    });
  },        []);

  const onSearchInput = (event: any) => {
    setTypedText(event.target.value);
  };

  const handleClearSearch = () => {
    setTypedText('');
    setResults([]);
  };

  useEffect(() => {
    if (typedText.length < 1) {
      setResults([]);

      return;
    }
    const foundItems: any[] = search(typedText);

    setResults(foundItems);
  },        [typedText]);

  const search = (keyWord: string) => {
    const result: any = {};

    for (const [key, value] of Object.entries(mappedEvents)) {
      for (const item of value as any) {
        const { startAt, text, location, notes } = item;

        if (
          text.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1 ||
          location.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1 ||
          notes.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1
        ) {
          const dateKey: string = formatTimestampToDate(startAt);

          if (result[dateKey] === undefined) {
            result[formatTimestampToDate(startAt)] = [item];
          } else {
            result[formatTimestampToDate(startAt)].push(item);
          }
        }
      }
    }

    return result;
  };

  return (
    <SearchView
      typedText={typedText}
      results={results}
      onSearchInput={onSearchInput}
      handleClearSearch={handleClearSearch}
    />
  );
};

export default Search;
