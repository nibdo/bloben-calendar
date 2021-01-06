import React from 'react';
import 'bloben-common/index.scss';
import StorageLayer from './bloben-package/layers/storage-layer';
import Store from './bloben-package/context/store';

const App = () =>

    (
        <Store>
            <StorageLayer/>
        </Store>
    )

export default App;
