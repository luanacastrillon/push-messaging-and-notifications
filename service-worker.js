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
  console.log('[Condor Service Worker] - (Listener: push) Push Received.');
  console.log(`[Condor Service Worker] - (Listener: push) Push had this data: "${event.data.text()}"`);
  
  var eventData = JSON.parse(event.data.text());
  
  console.log('[Condor Service Worker] - (Listener: push) EVENT DATA --> title=' + eventData.title);
  console.log('[Condor Service Worker] - (Listener: push) EVENT DATA --> message=' + eventData.message);
  
  var notificationTitle;
  var data;
  var tag;
  var options;
  
  switch (eventData.title[0]) {
    case "NEW_CALL":
        
        notificationTitle = 'Llamando...';
        
        data = {
            call_data: {
                from: '2364643610',
                is_missed_call: false
            }
        };
        
        tag = eventData.message[0];
        
        options = {
            body: '2364643610',
            icon: 'images/condor_calling.png',
            badge: 'images/condor_logo_2.png',
            vibrate: [10000, 100, 10000, 100, 10000, 100, 10000], // Vibra 40300ms en total...Vibra, pausa, vibra, pausa, vibra, pausa, vibra
            tag: tag,
            data:data

        };
        
        console.log(event);
        
        self.clients.matchAll().then(all => all.forEach(client => {
            //client.postMessage("START_AUDIO" + event.data);
            client.postMessage("START_AUDIO");
        }));
        
        break;
        
    case "CALL_END":
        
        notificationTitle = 'Llamada perdida';
        
        data = {
            call_data: {
                from: '2364643610',
                is_missed_call: true
            }
        };
        
        tag = eventData.message[0];
    
        options = {
            body: '2364643610',
            icon: 'images/condor_calling.png',
            badge: 'images/condor_logo_2.png',
            tag: tag,
            data: data
        };
    
        break;
    default:
        console.log("[Condor Service Worker] - (Listener: push) VINO OTRA OPCION!!");
    }
    
    const notificationPromise = self.registration.showNotification(notificationTitle, options);
    event.waitUntil(notificationPromise);

});

self.addEventListener('notificationclick', function(event) {
  
  console.log('[Condor Service Worker] - (Listener: notificationclick)  Notification click Received.');

  event.notification.close();
  
  var call_data = event.notification.data.call_data;
  
  console.log('[Condor Service Worker] - (Listener: notificationclick) DATA FROM NOTIF: is_missed_call= ' + call_data.is_missed_call);
  console.log('[Condor Service Worker] - (Listener: notificationclick) DATA FROM NOTIF: from= ' + call_data.from);

  event.waitUntil(
    //clients.openWindow('http://www.condortech.com.ar')
    //if(!call_data.is_missed_call) {
      
        self.clients.matchAll().then(all => all.forEach(client => {
            //client.postMessage("STOP_AUDIO" + event.data);
            client.postMessage("STOP_AUDIO");
        }))
    );
      
    //}
  //);
  
  console.log('[Condor Service Worker] - (Listener: notificationclick) HICIERON CLICK!!! ---> SE DEBE ESTABLECER LA LLAMADA O BIEN, DEJAR DEJAR DE ESCUCHAR EL AUDIO DE LA NOTIFICACION');
  
  registration.pushManager.getSubscription().then(function(subscription) {
    console.log("[Condor Service Worker] (Listener: notificationclick) Obtaining subscription endpoint: ", subscription.endpoint)
  });

  
});

self.addEventListener("message", function(event) {
    self.clients.matchAll().then(all => all.forEach(client => {
        client.postMessage("[Condor Service Worker] - (Listener: message) Responding to " + event.data);
    }));
});

self.addEventListener('install', function (event) {
    console.log("[Condor Service Worker] - (Listener: install) the worker was installed properly!");
    console.log(event);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    console.log("[Condor Service Worker] - (Listener: activate) it has actived properly");
    console.log(event);
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    console.log("[Condor Service Worker] - (Listener: fetch) fetching some data");
    console.log(event);   
});
