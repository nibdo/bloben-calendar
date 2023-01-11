import React, { useEffect } from 'react';

/**
 * Init indexed database
 * @constructor
 */
const StorageProvider = (props: any) => {
  useEffect(() => {
    // LocalForage.config();
  }, []);

  return <>{props.children}</>;
};
export default StorageProvider;
