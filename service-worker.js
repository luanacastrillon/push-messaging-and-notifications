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
  
  var eventData = JSON.parse(event.data.text());
  
  console.log('EVENT DATA --> title=' + eventData.title);
  console.log('EVENT DATA --> message=' + eventData.message);
  
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
            vibrate: [10000, 100, 20000, 100, 30000, 100, 40000], // Vibra 100300 ms en total...Vibra, pausa, vibra, pausa, vibra, pausa, vibra
            tag: tag,
            data:data

        };
        
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
        console.log("VINO OTRA OPCION!!");
    }
    
    const notificationPromise = self.registration.showNotification(notificationTitle, options);
    event.waitUntil(notificationPromise);

/*
  const title = 'Llamando...';
  
  var data = {
        call_data: {
            from: '2364643610',
            is_missed_call: false
        }
  };
  
  var ramdom_call_id = Math.random();
  var tag = 'call' + ramdom_call_id;
  
  const options = {
    body: '2364643610',
    icon: 'images/condor_calling.png',
    badge: 'images/condor_logo_2.png',
    vibrate: [10000, 100, 20000, 100, 30000, 100, 40000], // Vibra 100300 ms en total...Vibra, pausa, vibra, pausa, vibra, pausa, vibra
    tag: tag,
    data:data

  };
  
  const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
  
  setTimeout(replaceNotificationMissedCall,80000,tag);
*/

  //setTimeout(replaceNotificationMissedCall,60000);
  
 // fetch('https://www.gruveo.com/api/ring?' + (start ? 'start' : 'stop'), { method: 'HEAD' }).catch(function () {});

});

/*function replaceNotificationMissedCall(tag) {

    console.log('replaceNotificationMissedCall');
    
    console.log('TAG =' + tag);

    const title = 'Llamada perdida';
    
    var data = {
        call_data: {
            from: '2364643610',
            is_missed_call: true
        }
  };
    
    const options = {
        body: '2364643610',
        icon: 'images/condor_calling.png',
        badge: 'images/condor_logo_2.png',
        tag: tag,
        data: data
    };
  
    //const notificationPromise = self.registration.showNotification(title, options);
    //event.waitUntil(notificationPromise);
    
    self.registration.showNotification(title, options);    
}*/


self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();
  
  var call_data = event.notification.data.call_data;
  
  console.log('DATA FROM NOTIF: is_missed_call= ' + call_data.is_missed_call);
  console.log('DATA FROM NOTIF: from= ' + call_data.from);

  event.waitUntil(
    clients.openWindow('http://www.condortech.com.ar')
  );
  
  console.log('HICIERON CLICK!!! ---> DEBO DEJAR DE ENVIAR LAS NOTIFICACIONES');
  
  registration.pushManager.getSubscription().then(function(subscription) {
    console.log("GOT SUBSCRIPTION ID: ", subscription.endpoint)
  });

  
});