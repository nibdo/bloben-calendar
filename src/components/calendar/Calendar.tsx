import '../button/buttonBase/ButtonBase.scss';
import './Calendar.scss';
import 'kalend/dist/styles/index.css';
import { CALENDAR_EVENT_TYPE } from 'kalend/common/interface';
import { CALENDAR_VIEW } from 'kalend/common/enums';
import {
  CalDavAccount,
  CalDavCalendar,
  CalDavEvent,
  QueryRange,
  ReduxState,
} from '../../types/interface';
import { CalendarSettingsResponse } from '../../bloben-interface';
import { Context, StoreContext } from '../../context/store';
import { DateTime } from 'luxon';
import { EVENT_TYPE, SOURCE_TYPE } from '../../bloben-interface/enums';
import {
  InitialForm,
  createCalDavEvent,
  updateRepeatedEvent,
} from '../../views/event/editEvent/editEventHelper';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../enums';
import { SettingsLocal } from '../../redux/reducers/settingsLocal';
import { TOAST_STATUS } from '../../types/enums';
import {
  checkIfIsInRange,
  createToast,
  getLocalTimezone,
  getSyncRange,
  parseCssDark,
} from '../../utils/common';
import { createTask } from '../../views/event/editEvent/editTaskHelper';
import { createToastError } from 'bloben-components';
import { reduxStore } from '../../layers/ReduxProvider';
import { setCalendarDaysRange, setLocalSettings } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { useWidth } from '../../utils/layout';
import BottomSheetMobile from '../bottomSheetMobile/BottomSheetMobile';
import CalDavAccountModal from '../accountSelectionModal/calDavAccountModal/CalDavAccountModal';
import CalendarHeader from './CalendarHeader';
import DrawerDesktop from '../drawerDesktop/DrawerDesktop';
import DuplicateMultipleModal from '../duplicateMultipleModal/DuplicateModal';
import EditEvent from '../../views/event/editEvent/EditEvent';
import EventView, {
  checkIfHasRepeatPreAction,
} from '../../views/event/eventView/EventView';
import EventsApi from '../../api/EventsApi';
import GeneralApi from '../../api/GeneralApi';
import Kalend, {
  CalendarEvent,
  OnEventClickData,
  OnEventDragFinish,
  OnNewEventClickData,
} from 'kalend';
import MobileNavbar from '../mobileNavbar/MobileNavbar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import RepeatEventModal, {
  REPEAT_MODAL_TYPE,
} from '../repeatEventModal/RepeatEventModal';
import SearchModal from '../searchModal/SearchModal';
import SendInviteModal from '../sendInviteModalModal/SendInviteModal';

const parseHourHeight = (hourHeightSetting: number): number => {
  const element = document.querySelector('.Kalend__Calendar__table');
  if (!element) {
    return hourHeightSetting;
  }

  const rect = element.getBoundingClientRect();

  const maxHourHeight = hourHeightSetting * 24;

  if (rect.height > maxHourHeight) {
    return rect.height / 21;
  }

  return hourHeightSetting;
};

const Calendar = () => {
  const toast = useToast();
  const settingsLocal: SettingsLocal = useSelector(
    (state: ReduxState) => state.settingsLocal
  );
  const settings: CalendarSettingsResponse = useSelector(
    (state: ReduxState) => state.calendarSettings
  );
  const calDavEvents: CalDavEvent[] = useSelector(
    (state: ReduxState) => state.calDavEvents
  );
  const calDavAccounts: CalDavAccount[] = useSelector(
    (state: ReduxState) => state.calDavAccounts
  );
  const calDavCalendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );
  const kalendRef: any = useRef();
  const [selectedView, setSelectedView] = useState(settings.defaultView);
  const [selectedDate, setSelectedDate] = useState(
    DateTime.now().toFormat('MMMM yyyy')
  );

  const dispatch = useDispatch();

  const [events, setEvents] = useState<any[]>([]);

  const [isEditingEventOpen, setEditingEventOpen] = useState<any>(null);
  const [isEventViewOpen, setEventViewOpen] = useState<any>(null);
  const [isNewEventOpen, setIsNewEventOpen] = useState<any>(null);
  const [isRepeatModalOpen, setRepeatModalOpen] = useState<any>(null);
  const [isBottomSheetOpen, openBottomSheet] = useState<any>(false);
  const [currentE, setCurrentE] = useState<any>(null);
  const [toastIsLoading, setToastIsLoading] = useState(false);
  const [emailInviteModalVisible, openEmailInviteModal] = useState<any>(null);
  const [searchModalOpen, openSearchModal] = useState(false);
  const [duplicatingEvent, setDuplicatingEvent] = useState(false);
  const [duplicateModalOpen, openDuplicateModal] = useState<any>(false);

  const kalendState: any = useRef({});

  const wasInitRef: any = useRef(false);
  const hasEmailConfigRef = useRef(false);

  const [store, dispatchContext]: [StoreContext, any] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  useEffect(() => {
    hasEmailConfigRef.current =
      store?.emailConfig?.hasSystemConfig ||
      store?.emailConfig?.hasCustomConfig;
  }, [JSON.stringify(store.emailConfig)]);

  useEffect(() => {
    setContext('isAppStarting', false);

    setEvents(calDavEvents || []);
  }, []);

  const handleSyncWithRange = async () => {
    try {
      const range: QueryRange = getSyncRange(
        'Monday',
        kalendState?.current?.selectedDate || DateTime.now().toUTC().toString()
      );

      if (!checkIfIsInRange(range)) {
        setToastIsLoading(true);
        if (!toastIsLoading) {
          // toast({
          //   duration: null,
          //   status: 'info',
          //   title: 'Loading',
          //   position: TOAST_POSITION.TOP,
          //   isClosable: false,
          // });
        }
        const rangeEventsResponse = await EventsApi.getEvents(
          kalendState?.current?.range.rangeFrom, // range.rangeFrom,
          kalendState?.current?.range.rangeTo, //range.rangeTo
          store.isDark,
          settings.showTasks
        );

        toast.closeAll();
        setToastIsLoading(false);

        setEvents(rangeEventsResponse?.data);
        return;
      }
      setEvents(reduxStore.getState().calDavEvents || []);
    } catch (e) {
      setToastIsLoading(false);
      toast.closeAll();
    }
  };

  useEffect(() => {
    handleSyncWithRange();
  }, [JSON.stringify(calDavEvents)]); // TODO something better

  const openNewEvent = (eventData: OnNewEventClickData, e: any) => {
    // force all day on header click
    const isHeaderClick =
      e?.target?.className.indexOf('Kalend__CalendarHeaderDates__col') !== -1;

    setIsNewEventOpen({ ...eventData, isHeaderClick });
    setCurrentE(e);
  };
  const handleCloseNewEventModal = () => setIsNewEventOpen(null);

  const openEditingEvent = (eventData: CalDavEvent, duplicate?: boolean) => {
    setEditingEventOpen(eventData);
    if (duplicate) {
      setDuplicatingEvent(true);
    }
  };

  const handleCloseEditingEventModal = () => {
    setEditingEventOpen(null);

    setDuplicatingEvent(false);
  };

  const handleEventClick = (data: OnEventClickData, e: any) => {
    setEventViewOpen(data);
    setCurrentE(e);
  };

  const closeEventView = () => {
    setEventViewOpen(null);
  };

  const onDraggingFinish: OnEventDragFinish = async (
    prevEvent: CalendarEvent,
    updatedEvent: CalendarEvent,
    _: any,
    resetPosition: any
  ) => {
    try {
      wasInitRef.current = false;

      // handle more update options for repeated events
      if (checkIfHasRepeatPreAction(updatedEvent)) {
        setRepeatModalOpen({ updatedEvent, prevEvent, resetPosition });
        return;
      }

      if (updatedEvent?.attendees?.length && hasEmailConfigRef.current) {
        openEmailInviteModal({
          call: async (sendInvite?: boolean, inviteMessage?: string) => {
            await createCalDavEvent(
              updatedEvent as InitialForm,
              false,
              settings.timezone || getLocalTimezone(),
              undefined,
              undefined,
              prevEvent,
              sendInvite,
              inviteMessage
            );
          },
        });

        return;
      }

      if (prevEvent.type === CALENDAR_EVENT_TYPE.TASK) {
        await createTask(
          updatedEvent as InitialForm,
          false,
          settings.timezone || getLocalTimezone(),
          undefined,
          undefined,
          prevEvent
        );
      } else {
        await createCalDavEvent(
          updatedEvent as InitialForm,
          false,
          settings.timezone || getLocalTimezone(),
          undefined,
          undefined,
          prevEvent
        );
      }
    } catch (e: any) {
      toast(createToastError(e));
    }
  };

  const handleUpdateRepeatedEvent = async (
    value: REPEATED_EVENT_CHANGE_TYPE
  ) => {
    if (!isRepeatModalOpen) {
      return;
    }

    if (
      isRepeatModalOpen.updatedEvent?.attendees?.length &&
      hasEmailConfigRef.current
    ) {
      openEmailInviteModal({
        call: async (sendInvite?: boolean, inviteMessage?: string) => {
          await updateRepeatedEvent(
            isRepeatModalOpen.updatedEvent,
            value,
            undefined,
            undefined,
            isRepeatModalOpen.prevEvent,
            sendInvite,
            inviteMessage
          );
        },
      });

      setRepeatModalOpen(false);

      return;
    }

    await updateRepeatedEvent(
      isRepeatModalOpen.updatedEvent,
      value,
      undefined,
      undefined,
      isRepeatModalOpen.prevEvent
    );

    setRepeatModalOpen(false);
  };

  const onPageChange = async () => {
    handleSyncWithRange();
  };

  const onKalendStateChange = (data: any) => {
    // workaround for navigating to day view internal
    if (data.calendarDays.length === 1) {
      setSelectedView(CALENDAR_VIEW.DAY);
    }

    dispatch(setCalendarDaysRange(data.range));
    kalendState.current = data;
    setSelectedDate(
      DateTime.fromISO(kalendState?.current?.selectedDate).toFormat('MMMM yyyy')
    );
  };

  const handleRefresh = async () => {
    await GeneralApi.getSync();

    await handleSyncWithRange();
  };

  const handleOpenDrawer = () => {
    dispatch(
      setLocalSettings({
        drawerOpen: !settingsLocal.drawerOpen,
      })
    );
  };

  const width = useWidth();

  const handleSearchClick = async (
    id: string,
    type: SOURCE_TYPE,
    isDark: boolean
  ) => {
    try {
      const response = await EventsApi.getEvent(id, type, isDark);

      if (response.data) {
        handleEventClick(response.data as unknown as CalendarEvent, null);
      }
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }

    openSearchModal(false);
  };

  return (
    <div className={'Main__content__row'}>
      {settingsLocal.drawerOpen ? <DrawerDesktop /> : null}
      <div
        className={parseCssDark(
          `Calendar_container${settingsLocal.drawerOpen ? '-collapsed' : ''}`,
          store.isDark
        )}
        style={{
          width: settingsLocal.drawerOpen ? width - 200 : width,
        }}
      >
        <CalendarHeader
          kalendRef={kalendRef}
          selectedDate={selectedDate}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          handleRefresh={handleRefresh}
          handleOpenDrawer={handleOpenDrawer}
          openSearchModal={() => openSearchModal(true)}
        />
        {settings.defaultView ? (
          <Kalend
            kalendRef={kalendRef}
            onEventClick={handleEventClick}
            onNewEventClick={openNewEvent}
            events={events}
            initialDate={new Date().toISOString()}
            hourHeight={parseHourHeight(settings.hourHeight)}
            timeFormat={settings.timeFormat.toString()}
            weekDayStart={settings.startOfWeek}
            initialView={settings.defaultView}
            onEventDragFinish={onDraggingFinish}
            // disabledViews={settings.disabledViews}
            draggingDisabledConditions={{
              type: SOURCE_TYPE.WEBCAL,
            }}
            resizeDisabledConditions={{
              sourceType: SOURCE_TYPE.WEBCAL,
              type: EVENT_TYPE.TASK,
            }}
            // onSelectView={() => {}}
            onPageChange={onPageChange}
            disableMobileDropdown={true}
            // calendarIDsHidden={settings.hiddenCalendarIDs}
            onStateChange={onKalendStateChange}
            selectedView={selectedView || settings.defaultView}
            isNewEventOpen={isNewEventOpen !== null}
            showTimeLine={true}
            timezone={settings.timezone}
            showWeekNumbers={settings.showWeekNumbers}
            autoScroll={true}
            isDark={store.isDark}
          />
        ) : null}
        {isNewEventOpen ? (
          calDavAccounts.length && calDavCalendars.length ? (
            <EditEvent
              isNewEvent={true}
              event={undefined}
              newEventTime={isNewEventOpen}
              handleClose={handleCloseNewEventModal}
              wasInitRef={wasInitRef}
              currentE={currentE}
            />
          ) : (
            <CalDavAccountModal handleClose={handleCloseNewEventModal} />
          )
        ) : null}

        {isEditingEventOpen ? (
          <EditEvent
            isNewEvent={false}
            event={isEditingEventOpen}
            newEventTime={isNewEventOpen}
            handleClose={handleCloseEditingEventModal}
            currentE={currentE}
            isDuplicatingEvent={duplicatingEvent}
          />
        ) : null}

        {isEventViewOpen ? (
          <EventView
            data={isEventViewOpen}
            handleClose={closeEventView}
            openEditEventModal={openEditingEvent}
            currentE={currentE}
            openDuplicateModal={openDuplicateModal}
          />
        ) : null}
        {duplicateModalOpen ? (
          <DuplicateMultipleModal
            event={duplicateModalOpen}
            handleClose={() => openDuplicateModal(false)}
          />
        ) : null}
        {store.isMobile ? (
          <MobileNavbar
            openBottomSheet={() => openBottomSheet(true)}
            kalendRef={kalendRef}
          />
        ) : null}
        {store.isMobile && isBottomSheetOpen ? (
          <BottomSheetMobile
            isBottomSheetOpen={isBottomSheetOpen}
            onClose={() => openBottomSheet(false)}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
          />
        ) : null}

        {isRepeatModalOpen ? (
          <RepeatEventModal
            type={REPEAT_MODAL_TYPE.UPDATE}
            handleClose={() => {
              setRepeatModalOpen(null);
              if (isRepeatModalOpen.resetPosition) {
                isRepeatModalOpen.resetPosition();
              }
            }}
            title={''}
            handleClick={handleUpdateRepeatedEvent}
          />
        ) : null}

        {emailInviteModalVisible ? (
          <SendInviteModal
            handleClose={() => openEmailInviteModal(null)}
            clickData={emailInviteModalVisible}
          />
        ) : null}
      </div>

      {searchModalOpen ? (
        <SearchModal
          handleClose={() => openSearchModal(false)}
          handleClick={handleSearchClick}
        />
      ) : null}
    </div>
  );
};

export default Calendar;
