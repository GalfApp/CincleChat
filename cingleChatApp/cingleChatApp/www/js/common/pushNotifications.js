/**
 * Servicio responsable de manipular los eventos relacionados con las notificaciones push
 *
 * @author: Sebastián Lara <jhoansebastianlara@gmail.com> 
 *
 * @date 11/05/2016
 */

// docs: https://github.com/phonegap/phonegap-plugin-push/tree/master/docs
var pushNotifications = angular.module('pushNotifications', [])

pushNotifications.service('pushNotifications', function($rootScope, CONSTANTS) {

    var onRegistration = function(data) {
        // data.registrationId
        console.log('registration ok');
        console.log(data.registrationId);
        // se envía el token al servidor para que tenga una referencia del dispositivo y 
        // le pueda enviar notificaciones push
        window.localStorage.setItem('deviceToken', data.registrationId)
    }

    var onNotification = function(data) {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
        console.log('notification received');
        console.log(data);

        // si el usuario tiene abierta la app, entonces se muestra un banner indicandole de la notificacion
        if (additionalData.foreground) {
            // #code
            
        }

        // additionalData: Object
        //     alert: "fine"
        //     badge: 1
        //     coldstart: false
        //     data: "{\"KEY\":\"START_AUCTION\",\"ANOTHER_VAR\":\"bien!\"}"
        //     foreground: true
        //     sound: ""
        // Object Prototype
        // count: 1
        // message: "fine"
        // sound: ""
    }

    var onError = function(error) {
        // e.message
        console.log('error push');
        console.log(error);
    }
        
    /**
    *   Función que inicializa las notificaciones push en la app
    */
    this.init = function () {
        console.log('init push............');
        // objeto de configuración para las push
        var pushConfig = {
            ios: CONSTANTS.PUSH_NOTIFICATIONS.CONFIG.IOS
        }

        // se inicializan las push
        var push = PushNotification.init(pushConfig)

        // evento que se dispara cuando el dispositivo es registrado en el APN
        push.on('registration', onRegistration)

        // evento que se dispara cuando se recibe una notificacion
        push.on('notification', onNotification)

        // evento que se dispara cuando hay un error con las notificaciones
        push.on('error', onError)
    }


    /**
    *   Función que inicial los listeners que recibiran los eventos de push notifications
    */
    // this.startListeners = function () {
    //     alert('startListeners!')
    //     $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
    //         console.log('notificationReceived:');
    //         console.log(notification)
    //         console.log('event:');
    //         console.log(event);

    //         $cordovaPush.setBadgeNumber('25')
    //             .then(function(result) {
    //                 // Success!
    //                 console.log('set badge success');
    //             }, function(err) {
    //                 // An error occurred. Show a message to the user
    //             });
    //     });
    // }

    /**
    *   Función responsable de registrar el dispositivo en el APN para obtener el deviceToken
    */
    // this.register = function () {
    //     console.log('register push');
    //     console.log(CONSTANTS.PUSH_NOTIFICATIONS.CONFIG.IOS);
    //     $cordovaPush.register({
    //         "badge": true,
    //         "sound": true,
    //         "alert": true,
    //     }).then(function(deviceToken) {
    //         // Success -- send deviceToken to server, and store for future use
    //         console.log("deviceToken: " + deviceToken)
    //         // se registra el token en el servidor para que este pueda enviar notificaciones al dispositivo
    //         // #code
    //         window.localStorage.setItem('deviceToken', deviceToken)
    //     }, function (error) {
    //         console.log('error registering device:');
    //         console.log(error);
    //     })
    // }

})
