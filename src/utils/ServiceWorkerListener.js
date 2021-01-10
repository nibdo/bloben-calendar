import {
  findInEvents,
  parseStartAtDateForNotification
} from "./common";
import { checkIfIsSafari } from 'bloben-common/utils/common';
import { logger } from 'bloben-common/utils/common';

const isSafari = checkIfIsSafari();

const swListener = isSafari ? null : new BroadcastChannel('swListener');
//Set listener
const EVENT_TYPE = 'event';

const sendMsgToServiceWorker = (body) => {
  navigator.serviceWorker.controller.postMessage({ type: 'push', body });
};

/**
 * Receive JSON obj from push listener
 * Find obj by type and id and show notification
 * @returns {Promise<function(*): Promise<void>>}
 */
export const setServiceWorkerLister = async (
) => {
  // Receive notification from service worker
  return (swListener.onmessage = async (e) => {
    const notification = e.data;
    logger('notification', notification)

    // Try to find item from notification in state
    if (
      notification.type === EVENT_TYPE
    ) {
      // Find event
      const event = await findInEvents(notification.id)

      if (!event) {
        // TODO Try to fetch task from server
      }
      notification.title = event.text;
      notification.data = JSON.stringify(event);
      notification.body = parseStartAtDateForNotification(event.startAt);

      // await navigator.registration.showNotification(event.name, {
      //   body: event.dateFrom.toString(),
      //   data: JSON.stringify(event),
      //   // actions: [
      //   //   {action: 'complete', title: 'Mark as completed'},
      //   //   {action: 'postpone', title: 'Remind tomorrow'},
      //   // ],
      // });
      // Send decrypted task to service worker on message listener
      sendMsgToServiceWorker(notification);
    }
  });
};
