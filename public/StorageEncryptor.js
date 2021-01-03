
importScripts('openpgp.js');

/**
 * Receive trigger to encrypt storage on unload
 * @param event
 */
// import * as LocalForage from "localforage";

onmessage = function(event) {
   const messageData = event.data;

   // alert(messageData)
   console.log(openpgp)
   readDB()
   // handleStorageEncryption()
};

 const readDB = async () => {
   let request = await indexedDB.open("database");

   request.onupgradeneeded = function (event) {

   }

   request.onerror = function(event) {
      // Handle errors!
   };
   // Here comes onsuccess hell
   request.onsuccess = function(event) {
      const db = event.target.result;

      // Get system keys first
      const transactionSystemKeys = db.transaction(["storage"], "readwrite").objectStore("storage");
      const requestSystemKeys = transactionSystemKeys.get("systemKeys");

      requestSystemKeys.onsuccess = function (event) {
         const systemKeys = event.target.result;

         // Get redux storage
         const transactionRoot = db.transaction(["storage"], "readwrite").objectStore("storage");
         const requestRoot = transactionRoot.get("root");

         requestRoot.onsuccess = function (event) {
            const root = event.target.result;

            // Now encrypt root redux storage with system keys
            encryptData(systemKeys.publicKey, root).then(result => {
               // Save encrypted result
               const transactionEncrypted = db.transaction(["storage"], "readwrite").objectStore("storage");
               transactionEncrypted.put( result, 'encryptedRoot');

               // Now clean decrypted root to empty object
               const transactionRootCleaning = db.transaction(["storage"], "readwrite").objectStore("storage");
               transactionRootCleaning.put( {}, 'root');

               // And also set storage status as encrypted
               const transactionEncryptedStatus = db.transaction(["storage"], "readwrite").objectStore("storage");
               transactionEncryptedStatus.put( false, 'isStorageDecrypted');
            })
         };
      };
   }

   request.onerror = function(event) {
      console.log('error', event)
      // Do something with request.errorCode!
   };


}

var encryptData = async (publicKeyArmored, data) => {
   const options = {
      // eslint-disable-next-line no-undef
      message: openpgp.message.fromText(JSON.stringify(data)),
      // eslint-disable-next-line no-undef
      publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys
   }

   // eslint-disable-next-line no-undef
   const result = await openpgp.encrypt(options);

   return result.data;
};

