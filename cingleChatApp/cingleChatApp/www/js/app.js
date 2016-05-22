// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    // libs
    'ionic', 
    'restangular', 
    'underscore', 
    'ngCordova', 
    'jett.ionic.content.banner', 
    // app dependencies
    'MainController', 
    'utilities', 
    'constants',
    'pushNotifications'
])

.run(function($ionicPlatform, $rootScope, utilities, _, CONSTANTS, pushNotifications) {
    $ionicPlatform.ready(function() {
        // componentes globales de aplicación
        $rootScope.utilities = utilities
        $rootScope.CONSTANTS = CONSTANTS
        $rootScope._ = _

        // de entrada no se esta hablando con ningun usuario
        window.localStorage.setItem('currentUserIdChat', '0')

        // se inicializa el plugin de notificaciones
        pushNotifications.init()

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
            // StatusBar.hide();
        }
    });

    $rootScope.currentUserID = 213;
})

.config(function($stateProvider, $urlRouterProvider, RestangularProvider) {
    // restangular configuration
    RestangularProvider.setBaseUrl('http://api.cingleapp.com');
    RestangularProvider.setDefaultHeaders({
        'content-type': 'application/x-www-form-urlencoded'
    });

    // add full request interceptor
    // RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url) {
    //     console.log('addFullRequestInterceptor =>');
    //     console.log('element:');
    //     console.log(element);
    //     console.log('operation: %s', operation);
    //     console.log('what: %s', what);
    //     console.log('url: %s', url);
    //     console.log('addFullRequestInterceptor END');
    //     console.log('');
    //     return {holi:'request interceptor return'};
    // });
    // // add a request interceptor
    // RestangularProvider.addRequestInterceptor(function(element, operation, what, url) {
    //     console.log('addRequestInterceptor =>');
    //     console.log('element: %s', element);
    //     console.log('operation: %s', operation);
    //     console.log('what: %s', what);
    //     console.log('url: %s', url);
    //     console.log('addRequestInterceptor END');
    //     console.log('');
    //     return {holi:'request interceptor return'};
    // });
    // add a response interceptor
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        console.log('addResponseInterceptor =>');
        console.log('data:');
        console.log(data);
        console.log('operation: %s', operation);
        console.log('what: %s', what);
        console.log('url: %s', url);
        console.log('response:');
        console.log(response);
        console.log('deferred: %s', deferred);
        console.log('addResponseInterceptor END');
        console.log('');
        return response
    });

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        .state('chats', {
            url: '/chats',
            templateUrl: 'templates/chats.html',
            controller: 'ChatController'
        })

        .state('chats-detail', {
            url: '/chats/:userId/:agentId',
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatController'
        })

        .state('broadcast', {
            url: '/broadcast',
            templateUrl: 'templates/broadcast-message.html',
            controller: 'BroadcastController'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/chats');

});
