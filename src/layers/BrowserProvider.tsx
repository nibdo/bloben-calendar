import { BrowserRouter } from 'react-router-dom';
import React from 'react';

import { createBrowserHistory } from 'history';

createBrowserHistory();

interface BrowserLayerProps {
  children: any;
}
const BrowserProvider = (props: BrowserLayerProps) => {
  const { children } = props;

  return (
    <>
      <BrowserRouter>{children}</BrowserRouter>
    </>
  );
};

export default BrowserProvider;
