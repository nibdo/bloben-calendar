importScripts('openpgp.js');

const swListener = new BroadcastChannel('swListener');

const EVENT_TYPE = 'event';
const CACHE_NAME = 'static-cache';
const urlsToCache = [
  //'.',
  '/index.html',
];

// self.addEventListener('install', (event) => {
//   self.skipWaiting();
//   // @ts-ignore
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
//   );
// });
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim()); // Become available to all pages
});
/**
 * Listener for any received push notifications
 * First process push message here and send to main app if needed
 */
self.addEventListener('push', (event) => {
  // Parse string to JSON
  const data = event.data.json();

  // Can't decrypt content from here
  // Send data to app to retrieve relevant object from app
  if (data.type === EVENT_TYPE) {
    swListener.postMessage(data);
  }

  //self.registration.showNotification(data.title, options)
});

/*
 * Show notification after recieving message
 */
self.addEventListener('message', (event) => {
  //Show notification here

  if (event.data.body.type === 'event') {
    // Handle event reminder notification
    const item = event.data.body;
    self.registration.showNotification(item.title, {
      body: item.body,
      data: item.data,
      icon: './calendar_simple_icon.png',
      badge: './calendar_simple_icon.png'
    });
  }

  if (event.data.body.type === 'tasks') {
    // Handle task reminder notification

    const task = event.data.body;
    self.registration.showNotification('New task reminder', {
      body: task.text,
      data: task,
      actions: [
        { action: 'complete', title: 'Mark as completed' },
        { action: 'postpone', title: 'Remind tomorrow' },
      ],
    });
  }
  // if (event.data.type === 'push') {
  //   const notification = event.data.data;
  //   if (notification.type === 'invite') {
  //     // @ts-ignore
  //     self.registration.showNotification(notification.title, {
  //       body: notification.body,
  //     });
  //   } else {
  //     //Recieve decrypted data from main app and pass content to push msg
  //     // tslint:disable-next-line:no-shadowed-variable
  //     const notification = event.data.data;
  //     // @ts-ignore
  //   }
  // }
});

self.addEventListener('notificationclick', function (e) {
  // Handle clicks from notification
  const notification = e.notification;

  // TODO better notification body parsing
  // Action name from SW
  const action = e.action;

  const notificationClone = {
    data: e.notification.data,
  };


  if (action === 'complete') {
    // Send task to main app and mark as completed
    notificationClone.actionType = 'checkTask';
    swListener.postMessage(notificationClone);
    notification.close();
  } else if (action === 'postpone') {
    // Send task to main app and postpone reminder
    notificationClone.actionType = 'postpone';
    swListener.postMessage(notificationClone);
    notification.close();
  } else {
    // Open event in browser
    const eventLink = `https://calendar.dev.bloben.com/event/${notificationClone.data.id}`;
    e.waitUntil(clients.openWindow(eventLink));
    notification.close();
  }
});


self.addEventListener('fetch', () => {});

const encryptDatabase = async () => {
  return new Promise(async(resolve) => {


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
          resolve()
        })
      };
    };
  }

  request.onerror = function(event) {
    console.log('error', event)
    // Do something with request.errorCode!
  };

  })
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
