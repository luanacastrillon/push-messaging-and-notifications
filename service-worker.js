/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Llamando...';
  const options = {
    body: '2364643610',
    icon: 'images/condor_calling.png',
    badge: 'images/condor_logo_2.png',
    /*requireInteraction: true,*/
    /*renotify: true,*/
    vibrate: [30000, 100, 30000, 100, 30000, 100, 30000], // Vibrate 300ms, pause 100ms, then vibrate 400ms
    tag: 'call'
    /*sound: 'sound/IncyWincyArana.mp3'*/
  };
  
  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
  
  setTimeout(replaceNotificationMissedCall(event),10000);

  //setTimeout(replaceNotificationMissedCall,60000);
  
 // fetch('https://www.gruveo.com/api/ring?' + (start ? 'start' : 'stop'), { method: 'HEAD' }).catch(function () {});

});

function replaceNotificationMissedCall(event) {

    console.log('replaceNotificationMissedCall');

    const title = 'Llamada perdida';
    const options = {
        body: '2364643610',
        icon: 'images/condor_calling.png',
        badge: 'images/condor_logo_2.png',
        /*requireInteraction: true,*/
        /*renotify: true,*/
        /*vibrate: [30000, 100, 30000, 100, 30000, 100, 30000], // Vibrate 300ms, pause 100ms, then vibrate 400ms*/
        tag: 'call'
        /*sound: 'sound/IncyWincyArana.mp3'*/
    };
  
    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
    
    //self.registration.showNotification(title, options);    
}


self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('http://www.condortech.com.ar')
  );
  
  console.log('HICIERON CLICK!!! ---> DEBO DEJAR DE ENVIAR LAS NOTIFICACIONES');
  
  registration.pushManager.getSubscription().then(function(subscription) {
    console.log("GOT SUBSCRIPTION ID: ", subscription.endpoint)
  });

  
});