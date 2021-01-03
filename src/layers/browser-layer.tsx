import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReduxLayer from './redux-layer';

const BrowserLayer = (props: any) => {
    const {isDecrypted, state} = props;

    return (
        <BrowserRouter>
            {isDecrypted ? <ReduxLayer isDecrypted={isDecrypted} state={state}/> : null}
        </BrowserRouter>
    )

}

export default BrowserLayer;
