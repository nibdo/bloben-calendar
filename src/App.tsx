import React from 'react';
import 'bloben-common/index.scss';
import StorageProvider from './bloben-package/layers/StorageProvider';
import StoreProvider from './bloben-package/context/store';
import ContextProvider from './bloben-package/layers/ContextProvider';
import EncryptionProvider from './bloben-package/layers/EncryptionProvider';

const App = () => (
  <StoreProvider>
    <StorageProvider>
      <ContextProvider>
        <EncryptionProvider />
      </ContextProvider>
    </StorageProvider>
  </StoreProvider>
);

export default App;
