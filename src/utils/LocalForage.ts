import { isElectron } from '../env';
import localForage from 'localforage';

export const LocalForage = localForage.createInstance({
  name: 'database',
  version: 1,
  storeName: 'storage',
});

LocalForage.setDriver(
  isElectron ? localForage.LOCALSTORAGE : localForage.INDEXEDDB
)
  .then(() => {
    return;
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log(error);
  });

export default LocalForage;
