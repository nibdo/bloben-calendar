import React from 'react';

import {
  ChakraProvider,
  ColorModeProvider,
  ComponentStyleConfig,
  extendTheme,
} from '@chakra-ui/react';
import BrowserProvider from './layers/BrowserProvider';
import ContextProvider from './layers/ContextProvider';
import ElectronProvider from './layers/electronProvider';
import ReduxProvider from './layers/ReduxProvider';
import RouterProvider from './layers/Router';
import StorageProvider from './layers/StorageProvider';
import StoreProvider from './context/store';
import ThemeProvider from './layers/ThemeProvider';
import ThemeWrapper from './components/themeWrapper/ThemeWrapper';

const Input: ComponentStyleConfig = {
  defaultProps: {
    size: 'lg',
  },
};

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'base',
    _focus: { boxShadow: 'none' },
  },
  defaultProps: {
    size: 'md',
    variant: 'solid',
    _focus: { boxShadow: 'none' },
  },
};

const theme = extendTheme({
  components: {
    Button,
    Input,
    CheckBox: {
      defaultProps: {
        _focus: { boxShadow: 'none' },
      },
    },
  },
  colors: {
    primary: {
      200: '#EC407AB2',
      400: '#ec407a',
    },
  },
});

const App = () => (
  <ChakraProvider theme={theme}>
    <ElectronProvider>
      <ThemeWrapper>
        <StoreProvider>
          <StorageProvider>
            <ContextProvider>
              <ReduxProvider>
                <ColorModeProvider options={{ initialColorMode: 'light' }}>
                  <ThemeProvider>
                    <BrowserProvider>
                      <RouterProvider />
                    </BrowserProvider>
                  </ThemeProvider>
                </ColorModeProvider>
              </ReduxProvider>
            </ContextProvider>
          </StorageProvider>
        </StoreProvider>
      </ThemeWrapper>
    </ElectronProvider>
  </ChakraProvider>
);

export default App;
