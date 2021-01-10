import React from 'react';
import 'bloben-common/index.scss';
import StorageLayer from './bloben-package/layers/StorageLayer';
import Store from './bloben-package/context/store';

const App = () =>

    (
        <Store>
            <StorageLayer/>
        </Store>
    )

export default App;
