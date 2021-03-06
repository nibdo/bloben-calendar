import React, { useContext, useEffect, useState } from 'react';
import './Search.scss';
import IconButton from '@material-ui/core/IconButton';
import { EvaIcons, Input } from 'bloben-react';
import { useSelector } from 'react-redux';
import { parseEventColor } from '../../components/calendarView/calendar-common';
import { useHeight, parseCssDark } from 'bloben-react';
import { useHistory } from 'react-router-dom';
import SyncEvents from '../../utils/sync/EventsSync';
import { ButtonBase } from '@material-ui/core';
import { formatEventDate } from '../../utils/common';
import { Context } from 'bloben-module/context/store';

const SearchImage = () => (
  <div className={'search_empty__wrapper'}>
    <p className={'search_empty__text'}>No result</p>
  </div>
);

export const EventDateText = (props: any) => {
  const { event } = props;

  const humanDate: any = formatEventDate(event);
  const { dates, time } = humanDate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p className={'search-item__text'}>{dates}</p>
      <p className={'search-item__text'}>{time}</p>
    </div>
  );
};

const SearchItem = (props: any) => {
  const { item, isDark, history } = props;
  const { id, startAt, timezoneStart, endAt, summary, color } = item;
  const calendarColor: string = parseEventColor(color, isDark);

  const handleClick: any = () => {
    history.push(`/event/${id}`);
  };

  return (
    <ButtonBase className={'search-item__wrapper'} onClick={handleClick}>
      <div className={'search-item__container'}>
        <div
          className={'search-item__color'}
          style={{ background: calendarColor }}
        />
        <div className={'search-item__content'}>
          <h5 className={'search-item__title'}>{summary}</h5>
          <EventDateText event={item} />
        </div>
      </div>
    </ButtonBase>
  );
};

const renderResults = (events: any, isDark: boolean, history: any) => {
  return events.map((event: any) => {
    return <SearchItem item={event} isDark={isDark} history={history} />;
  });
};

interface IResultsProps {
  results: any;
}
const Results = (props: IResultsProps) => {
  const { results } = props;

  const [store] = useContext(Context);

  const { isDark } = store;

  const height: number = useHeight() - 56;
  const history: any = useHistory();

  const renderedResults: any = renderResults(results, isDark, history);

  return (
    <div className={'search__container-results'} style={{ height }}>
      {renderedResults}
    </div>
  );
};

interface SearchInputProps {
  typedText: string;
  onChange: any;
}
const SearchInput = (props: SearchInputProps) => {
  const { typedText, onChange } = props;

  const [store] = useContext(Context);

  const { isMobile, isDark } = store;

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
        isDark={isDark}
      />
    </div>
  );
};

interface SearchHeaderProps {
  typedText: string;
  onSearchInput: any;
  handleClearSearch: any;
}
const SearchHeader = (props: SearchHeaderProps) => {
  const { typedText, onSearchInput, handleClearSearch } = props;

  const history: any = useHistory();
  const [store] = useContext(Context);

  const { isMobile, isDark } = store;

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

interface MobileViewProps {
  results: any;
}
const MobileView = (props: MobileViewProps) => {
  const { results } = props;

  return results.length > 0 ? <Results results={results} /> : <SearchImage />;
};
interface DesktopViewProps {
  results: any;
}
const DesktopView = (props: DesktopViewProps) => {
  const { results } = props;

  return results.length > 0 ? <Results results={results} /> : null;
};

interface SearchViewProps {
  typedText: string;
  results: any;
  onSearchInput: any;
  handleClearSearch: any;
}
const SearchView = (props: SearchViewProps) => {
  const { typedText, results, onSearchInput, handleClearSearch } = props;

  const [store] = useContext(Context);

  const { isMobile } = store;

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

  const [typedText, setTypedText] = useState('');
  const [results, setResults]: any = useState([]);
  const [mappedEvents, setMappedEvents] = useState({});

  // useEffect(() => {
  //   const result: any = mapEventsToDates(allEvents);
  //
  //   if (result) {
  //     setMappedEvents(result);
  //   }
  // },        [allEvents.toString()]);

  /**
   * Get changes in allEvents on mount
   */
  useEffect(() => {
    SyncEvents.getAllLastSync();
  }, []);

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
  }, [typedText]);

  const search = (keyWord: string) => {
    const result: any = [];

    for (const item of allEvents) {
      const { startAt, summary, location, description } = item;

      if (
        summary.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1 ||
        location.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1 ||
        description.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1
      ) {
        result.push(item);
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
