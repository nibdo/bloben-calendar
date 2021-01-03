import Crypto from '../bloben-package/utils/encryption';
import { reduxStore } from '../layers/redux-layer';
import {
  setAllEvents,
  setEvents,
  setEventsAreFetching,
  setEventsLastSync,
} from '../redux/actions';
import { cloneDeep, createMultiDayClone } from './common';
import EventStateEntity from '../data/entities/state/event.entity';
import { findInArrayWithIndex } from './filter/findInArray';
import { EventResultDTO } from '../data/types';
import eventsLastSynced from '../redux/reducers/eventsLastSynced';
import { logger } from 'bloben-common/utils/common';
import OpenPgp, { PgpKeys } from '../bloben-package/utils/OpenPgp';

const decryptEvent = async (
  cryptoPassword: string,
  item: EventResultDTO
): Promise<EventStateEntity> => {
  const eventResultDTO: EventResultDTO = item;
  const decryptedData: any = await Crypto.decrypt(
    eventResultDTO.data,
    cryptoPassword
  );

  const finalForm: any = {
    ...eventResultDTO,
    ...decryptedData,
  };
  const newEvent: EventStateEntity = new EventStateEntity(finalForm);

  return newEvent.getReduxStateObj();
};

const decryptEventPgp = async (
  password: string,
  pgpKeys: PgpKeys,
  item: EventResultDTO
): Promise<EventStateEntity> => {
    const eventResultDTO: EventResultDTO = item;
    let decryptedData: any = await OpenPgp.decrypt(
    pgpKeys.publicKey,
    pgpKeys.privateKey,
    password,
    eventResultDTO.data
  );
    decryptedData = JSON.parse(decryptedData);

    const finalForm: any = {
    ...eventResultDTO,
    ...decryptedData,
  };
    const newEvent: EventStateEntity = new EventStateEntity(finalForm);

    return newEvent.getReduxStateObj();
};

export const decryptAllEvents = async (data: any): Promise<void> => {
  const store: any = reduxStore.getState();
  const cryptoPassword: any = store.cryptoPassword;
  const password: string = store.password;
  const pgpKeys: PgpKeys = store.pgpKeys;

  let allEventsClone: any = cloneDeep(store.allEvents);

  // Handle new, updated and deleted events
  if (store.eventsLastSynced) {
    logger('data', data);

    for (let j = 0; j < data.length; j += 1) {
      let newItem: any;

      if (!data[j].deletedAt) {
          if (pgpKeys && pgpKeys.publicKey) {
              newItem = await decryptEventPgp(password, pgpKeys, data[j]);
        } else {
              newItem = await decryptEvent(cryptoPassword, data[j]);
          }
      }

      // Filter deleted events
      if (data[j].deletedAt) {
        allEventsClone = allEventsClone.filter(
          (event: any) => event.id !== data[j].id
        );
      } else {
        if (allEventsClone.length === 0) {
          allEventsClone.push(newItem);
        } else {
          // Event is either new or needs update
          allEventsClone.map((event: any, index: number) => {
            if (event.id === newItem.id) {
              return newItem;
            }

            // Event not found, push it
            if (index + 1 === allEventsClone.length) {
              allEventsClone.push(newItem);
            }
          });
        }
      }

      if (j + 1 === data.length) {
        reduxStore.dispatch(setAllEvents(allEventsClone));
      }
    }
  } else {
    const result: any = [];

    if (data && data.length > 0) {
      for (const item of data) {

          if (!item.deletedAt) {
              const eventResultDTO: EventResultDTO = item;
              let simpleEventObj: EventStateEntity;
              if (pgpKeys && pgpKeys.publicKey) {
                  simpleEventObj = await decryptEventPgp(
                      password,
                      pgpKeys,
                      eventResultDTO
                  );
              } else {
                  simpleEventObj = await decryptEvent(cryptoPassword, eventResultDTO);
              }
              result.push(simpleEventObj);
          }

      }
    }
    reduxStore.dispatch(setAllEvents(result));
  }

  reduxStore.dispatch(setEventsLastSync(new Date()));
};

export const decryptEvents = async (data: any): Promise<void> => {
  const store: any = reduxStore.getState();
  // Clone state
  const stateClone: any = cloneDeep(store.events);

  const cryptoPassword: any = store.cryptoPassword;
  const password: string = store.password;
  const pgpKeys: PgpKeys = store.pgpKeys;

  if (!data || data.length === 0) {
    return;
  }
  const objEntries: any = Object.entries(data);

  // Prepare day arrays
  for (let i = 0; i < data.length; i++) {
    // Decrypt events
    const decryptedEvents: any = [];

    // // Add day to allDays for Agenda view
    // if (agendaDays.indexOf(key) === -1) {
    //   agendaDays.push(key);
    // }
    const eventResultDTO: EventResultDTO = data[i];

    let decryptedData: any;

    if (pgpKeys && pgpKeys.publicKey) {
      decryptedData = await OpenPgp.decrypt(
          pgpKeys.publicKey,
          pgpKeys.privateKey,
          password,
          eventResultDTO.data
      );
      decryptedData = JSON.parse(decryptedData);
    } else {
      decryptedData = await Crypto.decrypt(eventResultDTO.data, cryptoPassword);
    }

    const finalForm: any = {
      ...eventResultDTO,
      ...decryptedData,
    };
    const newEvent: EventStateEntity = new EventStateEntity(finalForm);
    const simpleEventObj: EventStateEntity = newEvent.getReduxStateObj();

    /**
     * Logic for saving event
     */
    const handleEventSave = async (date: any) => {
      const eventsArray: any[] = stateClone[date];
      // Check if there is date in redux store with event datekey
      // Datekey exists, add new item or update existing
      if (eventsArray && eventsArray.length > 0) {
        const itemInState: any = await findInArrayWithIndex(
            eventsArray,
            simpleEventObj
        );
        // Item exists, update it
        if (itemInState.children) {
          stateClone[date][itemInState.index] = simpleEventObj;
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        } else {
          eventsArray.push(simpleEventObj);
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        }
      } else {
        stateClone[date] = [];
        stateClone[date].push(simpleEventObj);
        if (i + 1 === data.length) {
          reduxStore.dispatch(setEvents(stateClone));
          reduxStore.dispatch(setEventsAreFetching(false));
        }
      }
    };

    /**
     * Handle multi day events
     * // TODO destroy on delete and on update and recreate new
     */
    if (newEvent.isMultiDay) {
      const multiDayDates: any = createMultiDayClone(newEvent);

      for (const date of multiDayDates) {
        await handleEventSave(date);
      }
    }
    // Get dateKey
    const dateKey: string = newEvent.getDateKey();

    await handleEventSave(dateKey);
  }
}
