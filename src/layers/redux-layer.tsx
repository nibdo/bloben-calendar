import React, { useEffect, useState } from 'react';
import 'bloben-common/index.scss';
import AppLayer from 'layers/app-layer';
import { createStore, Store } from 'redux';
import { Provider } from 'react-redux';

import rootReducer from 'redux/reducers';
import LoadingScreen from 'bloben-common/components/loading-screen/loading-screen';
import { loadState, saveState } from '../redux/localstorage';
import { PgpKeys } from '../bloben-package/utils/OpenPgp';
import { LocalForage } from '../bloben-package/utils/LocalForage';

export let reduxStore: Store;

const ReduxLayer = (props: any) => {
    const {isDecrypted, state} = props;
    const [isLoaded, setIsLoaded] = useState(false)
    const [publicKey, setPublicKey] = useState('')

    const initReduxStore = async () => {
        const persistedState: any = await loadState(state);

        reduxStore = createStore(rootReducer, persistedState);

        setIsLoaded(true);

        // TODO remove some date keys from triggering save
        reduxStore.subscribe(() => {
                    saveState(reduxStore.getState());
        });
    }

    const initPublicKey = async () => {
        const systemKeys: PgpKeys | null = await LocalForage.getItem('systemKeys');

        if (systemKeys) {
            setPublicKey(systemKeys.publicKey)
        }
    }

    useEffect(() => {
        if (isDecrypted) {
            // REDUX STORE
            initReduxStore()
            initPublicKey()
        }
    }, [isDecrypted])

    return     (
        isLoaded ? <Provider store={reduxStore}>
            {isDecrypted ?
                reduxStore.getState().calendarView ? <AppLayer initPath={window.location.href}  /> : null
            : null
            }
        </Provider>

            : null
    )
}


export default ReduxLayer;
