import React, { useEffect } from 'react';
import EncryptionLayer from './encryption-layer';
import { LocalForage } from 'bloben-package/utils/LocalForage';


const StorageLayer = (props: any) => {
    LocalForage.config();

    return (
        <EncryptionLayer/>
    )
}



export default StorageLayer;
