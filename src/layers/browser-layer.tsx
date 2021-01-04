import React, { useContext, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReduxLayer from './redux-layer';
import { Context } from '../bloben-package/context/store';
import Alert from '../bloben-package/components/alert/alert';
import { Snackbar } from '@material-ui/core';

const BrowserLayer = (props: any) => {
    const {isDecrypted, state} = props;



    return (
        <BrowserRouter>
            {isDecrypted ? <ReduxLayer isDecrypted={isDecrypted} state={state}/> : null}
        </BrowserRouter>
    )

}

export default BrowserLayer;
