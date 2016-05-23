/**
 *   Script que contiene las constantes de la aplicación.
 *
 *   @author: Sebastián Lara <jhoansebastianlara@gmail.com>
 *   
 *   @date: 07/05/2016
 */

var constants = angular.module('constants', [])

/**
 *   Objeto que se exporta como constantes 
 */
var CONSTANTS = {
    // 
    USERS: {
        NICOLE: {
            CODE: 1
        },
        DAVID: {
            CODE: 2
        },
    },

    // idiomas
    LANGUAGES: {
        ES: 'es',
        EN: 'en'
    },
    // plataformas soportadas
    PLATFORMS: {
        IOS: 'iOS',
        ANDROID: 'Android'
    },
    // posibles estados de la app
    STATES: {
        FOREGROUND: 'foreground',
        BACKGROUND: 'background'
    },
    // keys de las variables almacenadas en el loca storage
    LOCAL_STORAGE: {
        IS_CONNECTED: 'isConnected',
    },

    DATE_FORMATS: {
        DB_FORMAT: 'yyyy-mm-dd',
        USA_FORMAT: 'MM/dd/yyyy',
    },

    PUSH_NOTIFICATIONS: {
        CONFIG: {
            IOS: {
                'badge': true,
                'sound': true,
                'alert': true
            },
            ANDROID: {
                'senderID': '269897237067',
                'iconColor': '#009966'
            }
        }
    },

    LOADING: {
        OPTIONS: {
            content: '<i class="icon ion-loading-d"></i>',
            animation: 'fade-in',
            showBackdrop: true,
            //hideOnStateChange: true,
            maxWidth: 200,
            showDelay: 5,
            duration: 20000 // maximo cantidad de segundos mostrando el loading
        }
    }

}

// constantes de la aplicación
constants.constant('CONSTANTS', CONSTANTS)
