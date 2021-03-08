import { findInArrayById, cloneDeep } from '../utils/common';
import { OpenPgp, User, NotificationApi } from 'bloben-utils';
import { ISyncLog } from 'types/types';
import { AxiosResponse } from 'axios';
import { setNotificationsSyncLog, addNotification } from '../redux/actions';
import { INotification } from 'bloben-utils/models/Notification';
import { reduxStore } from 'bloben-module/layers/ReduxProvider';

const decryptItem = async (
  item: any,
  user: User,
  password: string
): Promise<any> => {
  let decryptedData: any = await OpenPgp.decrypt(
    user.publicKey,
    user.privateKey,
    password,
    item.data
  );
  decryptedData = JSON.parse(decryptedData);

  // Merge
  const decryptedItem: any = { ...item, ...decryptedData };

  return new Notification(decryptedItem);
};

const SyncNotification: any = {
  getAll: async () => {
    const store: any = reduxStore.getState();
    const password: string = store.password;
    const user: User = store.user;
    const syncLog: ISyncLog = store.syncLog;
    const stateClone: any = cloneDeep(store.notifications);

    const response: AxiosResponse = await NotificationApi.getNotifications(
      syncLog.notifications
    );

    reduxStore.dispatch(setNotificationsSyncLog());

    const { data } = response;

    for (const item of data) {
      const { id } = item;

      const notification: any = await decryptItem(item, user, password);

      const notificationInState: INotification | null = await findInArrayById(
        stateClone,
        id
      );

      // Create item
      if (!notificationInState) {
        reduxStore.dispatch(addNotification(notification));
      }
    }
  },
  addNotification: async (id: string) => {
    const store: any = reduxStore.getState();
    const password: string = store.password;
    const user: User = store.user;

    const response: AxiosResponse = await NotificationApi.getNotificationById(
      id
    );

    const calendar: any = await decryptItem(response.data, user, password);

    reduxStore.dispatch(addNotification(calendar));
  },
};

export default SyncNotification;
