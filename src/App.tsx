import React from 'react';

import StoreProvider from './bloben-module/context/store';
import StorageProvider from 'bloben-module/layers/StorageProvider';
import ContextProvider from 'bloben-module/layers/ContextProvider';
import EncryptionProvider from 'bloben-module/layers/EncryptionProvider';

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
