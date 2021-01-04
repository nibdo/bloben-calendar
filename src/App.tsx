import React from 'react';
import 'bloben-common/index.scss';
import StorageLayer from './layers/storage-layer';
import Store from './bloben-package/context/store';

const App = () => {

    return   (
        <Store>
            <StorageLayer/>
        </Store>
    )
}


export default App;
