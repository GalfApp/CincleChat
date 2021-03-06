/**
 * Servicio responsable de manipular los eventos relacionados con las notificaciones push
 *
 * @author: Sebastián Lara <jhoansebastianlara@gmail.com> 
 *
 * @date 11/05/2016
 */

// docs: https://github.com/phonegap/phonegap-plugin-push/tree/master/docs
var pushNotifications = angular.module('pushNotifications', [])

pushNotifications.service('pushNotifications', ['$rootScope', 'CONSTANTS', '$cordovaVibration', '$timeout',
    function($rootScope, CONSTANTS, $cordovaVibration, $timeout) {

        // elemento que contiene la plantilla para mostrar la push
        $rootScope.notification = document.getElementById('app-notification')

        /**
        *   Función responsbale de mostrar una inapp-notification
        */
        var showNotification = function (notificationData, options) {
            console.log('notificationData:');
            console.log(notificationData);
            // si no hay datos para mostrar, no se muestra nada
            if (!notificationData) {
                return
            }

            // se asingna la información al contexto
            $rootScope.inAppNotification = notificationData;
            $rootScope.$apply()

            var optionsDefault = {
                translateY: 100,
                delayIn: '0s',
                delayOut: '5s',
                durationIn: '0.5s',
                durationOut: '0.3s'
            }

            if (!options) {
                options = optionsDefault
            }

            // se valida si esta disponible el componente de vibración
            if ($cordovaVibration) {
                // vibración
                $cordovaVibration.vibrate(10)

                $timeout(function () {
                    $cordovaVibration.vibrate(150)
                }, 100)
            }

            $rootScope.notification.style.display = "block"; // block | none
            console.log('options notification')
            console.log(options)

            var moveObj = move($rootScope.notification)
                .ease('in-out')
                .y(options.translateY)
                .delay(options.delayIn)
                .duration(options.durationIn)
                .end(function () {
                    console.log('show notification done');
                    move($rootScope.notification)
                        .ease('in-out')
                        .y(options.translateY * -1)
                        .delay(options.delayOut)
                        .duration(options.durationOut)
                        .end(function () {
                            console.log('hide notification done');
                        });
                });
        }

        var onRegistration = function(data) {
            // data.registrationId
            console.log(data.registrationId);
            // se envía el token al servidor para que tenga una referencia del dispositivo y 
            // le pueda enviar notificaciones push
            window.localStorage.setItem('deviceToken', data.registrationId)

            // se emite el evento para almacenar el token en el server
            $rootScope.$broadcast('saveDeviceTokenEvent', {
                deviceToken: data.registrationId
            });
        }

        var onNotification = function(data) {
            console.log('notification received');
            console.log(data);

            $rootScope.$broadcast('onNotificationEvent');

            // si el usuario tiene la app en primer plano, entonces se muestra una inapp-notification
            if (data.additionalData && data.additionalData.data) {
                // se convierte a json la info de la notificación
                var dataJson = angular.fromJson(data.additionalData.data)

                console.log('dataJson');
                console.log(dataJson);

                if (data.additionalData.foreground === true) {
                    // objeto para mostrar la inapp-notification
                    var notificationData = {
                        title: (dataJson.nombres && dataJson.nombres.length === 1) ? (dataJson.nombres[0].nombre + ' ' + dataJson.nombres[0].apellido) : 'New Message',
                        message: dataJson.mensaje,
                        image: (dataJson.foto && dataJson.foto.length === 1) ? dataJson.foto[0].foto : 'img/logo.svg',
                        userId: dataJson.user_p,
                        agentId: dataJson.user_s
                    }

                    var currentUserIdChat = window.localStorage.getItem('currentUserIdChat')
                    console.log('currentUserIdChat: ' + currentUserIdChat)
                    // si el usuario esta en un chat y llega una push del mismo usuario, entonces no se muestra el inapp-notification
                    if (currentUserIdChat != dataJson.user_p) {
                        // se muestra la notificación
                        showNotification (notificationData)
                    }
                } else {
                    $rootScope.$broadcast('goToNotificationEvent', {
                        userId: dataJson.user_p,
                        agentId: dataJson.user_s
                    });
                }
            }

        }

        var onError = function(error) {
            alert('error notification')
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
    }])
