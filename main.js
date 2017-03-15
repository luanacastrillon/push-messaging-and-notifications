'use strict';

var API_KEY = window.GoogleSamples.Config.gcmAPIKey;
var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

var curlCommandDiv = document.querySelector('.js-curl-command');
var isPushEnabled = false;

// This method handles the removal of subscriptionId
// in Chrome 44 by concatenating the subscription Id
// to the subscription endpoint
function endpointWorkaround(pushSubscription) {
    
    console.log('Starting endpointWorkaround() method...');
  // Make sure we only mess with GCM
  if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
    return pushSubscription.endpoint;
  }

  var mergedEndpoint = pushSubscription.endpoint;
  // Chrome 42 + 43 will not have the subscriptionId attached
  // to the endpoint.
  if (pushSubscription.subscriptionId &&
    pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
    // Handle version 42 where you have separate subId and Endpoint
    mergedEndpoint = pushSubscription.endpoint + '/' +
      pushSubscription.subscriptionId;
  }
  
  console.log('Finishing endpointWorkaround() method...');
  return mergedEndpoint;
}

function sendSubscriptionToServer(subscription) {
    
    console.log('Starting sendSubscriptionToServer() method...');
  // TODO: Send the subscription.endpoint
  // to your server and save it to send a
  // push message at a later date
  //
  // For compatibly of Chrome 43, get the endpoint via
  // endpointWorkaround(subscription)
  console.log('TODO: Implement sendSubscriptionToServer()');
  
  const subscriptionJson = document.querySelector('.js-subscription-json');
  
   if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    
    console.log('OBJETO SUSBRIPCION' + subscription);
    
    console.log('PROBANDO DATOS DE LA SUSCRIPCION' + subscriptionJson.textContent);
    
  }

  var mergedEndpoint = endpointWorkaround(subscription);

  // This is just for demo purposes / an easy to test by
  // generating the appropriate cURL command
  showCurlCommand(mergedEndpoint);
  
  console.log('Finishing sendSubscriptionToServer() method...');
}

// NOTE: This code is only suitable for GCM endpoints,
// When another browser has a working version, alter
// this to send a PUSH request directly to the endpoint
function showCurlCommand(mergedEndpoint) {
    
    console.log('Starting showCurlCommand() method...');
  // The curl command to trigger a push message straight from GCM
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    window.Demo.debug.log('This browser isn\'t currently ' +
      'supported for this demo');
    return;
  }

  var endpointSections = mergedEndpoint.split('/');
  var subscriptionId = endpointSections[endpointSections.length - 1];

  var curlCommand = 'curl --header "Authorization: key=' + API_KEY +
    '" --header Content-Type:"application/json" ' + GCM_ENDPOINT +
    ' -d "{\\"registration_ids\\":[\\"' + subscriptionId + '\\"]}"';

  curlCommandDiv.textContent = curlCommand;
  
  console.log('Finishing showCurlCommand() method...');
}

function unsubscribe() {
    
    console.log('Starting unsubscribe() method...');
  var pushButton = document.querySelector('.js-push-button');
  pushButton.disabled = true;
  curlCommandDiv.textContent = '';

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    // To unsubscribe from push messaging, you need get the
    // subcription object, which you can call unsubscribe() on.
    serviceWorkerRegistration.pushManager.getSubscription().then(
      function(pushSubscription) {
        // Check we have a subscription to unsubscribe
        if (!pushSubscription) {
          // No subscription object, so set the state
          // to allow the user to subscribe to push
          isPushEnabled = false;
          pushButton.disabled = false;
          pushButton.textContent = 'Enable Push Messages';
          return;
        }

        // TODO: Make a request to your server to remove
        // the users data from your data store so you
        // don't attempt to send them push messages anymore

        // We have a subcription, so call unsubscribe on it
        pushSubscription.unsubscribe().then(function() {
          pushButton.disabled = false;
          pushButton.textContent = 'Enable Push Messages';
          isPushEnabled = false;
        }).catch(function(e) {
          // We failed to unsubscribe, this can lead to
          // an unusual state, so may be best to remove
          // the subscription id from your data store and
          // inform the user that you disabled push

          window.Demo.debug.log('Unsubscription error: ', e);
          pushButton.disabled = false;
        });
      }).catch(function(e) {
        window.Demo.debug.log('Error thrown while unsubscribing from ' +
          'push messaging.', e);
      });
  });
  
  console.log('Finishing unsubscribe() method...');
}

function subscribe() {
    
    console.log('Starting subscribe() method...');
  // Disable the button so it can't be changed while
  // we process the permission request
  var pushButton = document.querySelector('.js-push-button');
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
      .then(function(subscription) {
        // The subscription was successful
        isPushEnabled = true;
        pushButton.textContent = 'Disable Push Messages';
        pushButton.disabled = false;

        // TODO: Send the subscription subscription.endpoint
        // to your server and save it to send a push message
        // at a later date
        return sendSubscriptionToServer(subscription);
      })
      .catch(function(e) {
        if (Notification.permission === 'denied') {
          // The user denied the notification permission which
          // means we failed to subscribe and the user will need
          // to manually change the notification permission to
          // subscribe to push messages
          window.Demo.debug.log('Permission for Notifications was denied');
          pushButton.disabled = true;
        } else {
          // A problem occurred with the subscription, this can
          // often be down to an issue or lack of the gcm_sender_id
          // and / or gcm_user_visible_only
          window.Demo.debug.log('Unable to subscribe to push.', e);
          pushButton.disabled = false;
          pushButton.textContent = 'Enable Push Messages';
        }
      });
  });
  
  console.log('Finishing subscribe() method...');
}

// Once the service worker is registered set the initial state
function initialiseState() {
    
    console.log('Starting initialiseState() method...');
  // Are Notifications supported in the service worker?
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    window.Demo.debug.log('Notifications aren\'t supported.');
    return;
  }

  // Check the current Notification permission.
  // If its denied, it's a permanent block until the
  // user changes the permission
  if (Notification.permission === 'denied') {
    window.Demo.debug.log('The user has blocked notifications.');
    return;
  }

  // Check if push messaging is supported
  if (!('PushManager' in window)) {
    window.Demo.debug.log('Push messaging isn\'t supported.');
    return;
  }

  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription()
      .then(function(subscription) {
          
        console.log(`Service worker registered with scope ${serviceWorkerRegistration.scope}`);
          
        // Enable any UI which subscribes / unsubscribes from
        // push messages.
        var pushButton = document.querySelector('.js-push-button');
        pushButton.disabled = false;

        if (!subscription) {
          // We aren’t subscribed to push, so set UI
          // to allow the user to enable push
          return;
        }

        // Keep your server in sync with the latest subscription
        sendSubscriptionToServer(subscription);

        // Set your UI to show they have subscribed for
        // push messages
        pushButton.textContent = 'Disable Push Messages';
        isPushEnabled = true;
        
        //PROBANDO LUA!!!!
        //  VER ESTO, QUE POR AHI ME SIRVA PARA ENVIAR EL CLIENT ID (SI ES QUE PUEDO SACARLO DE LA SUBSCRITION)
        if (navigator.serviceWorker.controller) {
            // Yes, send our controller a message.
            console.log("Sending 'hiooooooo' to controller");
            navigator.serviceWorker.controller.postMessage("hiooooooo");
        }
        
      })
      .catch(function(err) {
        window.Demo.debug.log('Error during getSubscription()', err);
      });
  });
  
  console.log('Finishing initialiseState() method...');
  
}

var audio = new Audio('risa-de-bruja.mp3');

function reproduceSound() {

    console.log("REPRODUCING SOUND!!!!!");
    
    //var audio = new Audio('anuncioMP3.mp3');
    
    audio = new Audio('risa-de-bruja.mp3');
    audio.play();
    
}

function stopSound() {

    console.log("STOPPING SOUND!!!!!");
    
    //var audio = new Audio('anuncioMP3.mp3');
    //audio.stop();
    
    audio.pause();
    audio.currentTime = 0;
    
}

window.addEventListener('load', function() {
    
  console.log('Addinf listener to push button...');
  
  var pushButton = document.querySelector('.js-push-button');
  pushButton.addEventListener('click', function() {
    if (isPushEnabled) {
      unsubscribe();
    } else {
      subscribe();
    }
  });
  
  //PROBANDO LUA!!!!
  //navigator.serviceWorker.controller.postMessage("LUA");
  
    // Listen to messages from service workers.
    navigator.serviceWorker.addEventListener('message', function(event) {
        
        console.log("LISTENER MESSAGE --> Got reply from service worker: " + event.data);
        
        //reproduceSound();
        
        switch (event.data) {
            case "START_AUDIO":
                reproduceSound();
                break;
        
            case "STOP_AUDIO":
                stopSound();
                break;
            default:
                console.log("LISTENER MESSAGE --> VINO OTRA OPCION!!");
        }
        
         console.log("LISTENER MESSAGE --> fin ");
        
        //var thissound=document.getElementById('anuncioMP3');
        //thissound.play();
        
        //var audio = new Audio('anuncioMP3.mp3');
        //audio.play();
        
    });

    // Listen to messages from service workers.
    /*navigator.serviceWorker.addEventListener('push', function(event) {
        
        console.log("LISTENER PUSH --> Got reply from service worker: " + event.data);
        
        reproduceSound();
        
        console.log("LISTENER PUSH --> fin ");
        
    });*/
    
    //PROBANDO LUA!!!!
    // Are we being controlled?
    /*if (navigator.serviceWorker.controller) {
        // Yes, send our controller a message.
        console.log("Sending 'hiooooooo' to controller");
        navigator.serviceWorker.controller.postMessage("hiooooooo");
    } else {*/

        // Check that service workers are supported, if so, progressively
        // enhance and add push messaging support, otherwise continue without it.
        if ('serviceWorker' in navigator) {
            console.log('Registring service worker...');
            navigator.serviceWorker.register('./service-worker.js', { insecure: true })
            .then(initialiseState);
        } else {
            window.Demo.debug.log('Service workers aren\'t supported in this browser.');
        }
        
    //}
  
});
