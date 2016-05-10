// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'restangular', 'underscore', 'MainController', 'ChatService', 'utilities', 'constants'])

.run(function($ionicPlatform, $rootScope, utilities, _, CONSTANTS) {
    $ionicPlatform.ready(function() {
        // componentes globales de aplicación
        $rootScope.utilities = utilities;
        $rootScope.CONSTANTS = CONSTANTS;
        $rootScope._ = _;

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
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
            url: '/chats/:userId',
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatController'
        })

        .state('broadcast', {
            url: '/broadcast',
            templateUrl: 'templates/broadcast-message.html',
            controller: 'BroadcastController'
        })



    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    .state('activities', {
        url: '/activities',
        views: {
            'tab-activities': {
                templateUrl: 'templates/tab-activities.html',
                controller: 'ActivitiesCtrl'
            }
        }
    })

    // Each tab has its own nav history stack:

    .state('tab.activities', {
            url: '/activities',
            views: {
                'tab-activities': {
                    templateUrl: 'templates/tab-activities.html',
                    controller: 'ActivitiesCtrl'
                }
            }
        })
        .state('room', {
            url: '/room/:roomId',
            templateUrl: 'templates/room.html',
            controller: 'RoomCtrl'
        })
        .state('room-user', {
            url: '/room/:roomId/:userId',
            templateUrl: 'templates/room.html',
            controller: 'RoomCtrl'
        })
        .state('room-group', {
            url: '/room/:roomId/:groupName/:userList',
            templateUrl: 'templates/room.html',
            controller: 'RoomCtrl'
        })

    .state('room-setting', {
        url: '/room-setting/:roomId',
        templateUrl: 'templates/room-setting.html',
        controller: 'RoomSettingCtrl'
    })

    .state('room-setting-user', {
            url: '/room-setting/:roomId/:userId',
            templateUrl: 'templates/room-setting.html',
            controller: 'RoomSettingCtrl'
        })
        .state('room-setting-group', {
            url: '/room-setting/:roomId/:groupName/:userList',
            templateUrl: 'templates/room-setting.html',
            controller: 'RoomSettingCtrl'
        })
        .state('user-setting', {
            url: '/user-setting/:userId',
            templateUrl: 'templates/user-setting.html',
            controller: 'UserSettingCtrl'
        })

    .state('tab.groups', {
        url: '/groups',
        views: {
            'tab-groups': {
                templateUrl: 'templates/tab-groups.html',
                controller: 'GroupsCtrl'
            }
        }
    })

    .state('tab.friends', {
            url: '/friends',
            abstract: true,
            views: {
                'tab-friends': {
                    templateUrl: 'templates/tab-friends.html',
                    controller: 'FriendsCtrl'
                }
            }
        })
        .state('tab.friends.messenger', {
            url: '/messenger',

            templateUrl: 'templates/tab-friends-messenger.html'

        })
        .state('tab.friends.active', {
            url: '/active',

            templateUrl: 'templates/tab-friends-active.html'

        })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    })

    // All templates about user
    .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html'
        })
        .state('sign-up', {
            url: '/sign-up',
            templateUrl: 'templates/sign-up.html'
        })
        .state('sign-up-name', {
            url: '/sign-up-name',
            templateUrl: 'templates/sign-up-name.html'
        })
        .state('sign-up-photo', {
            url: '/sign-up-photo',
            templateUrl: 'templates/sign-up-photo.html'
        })
        .state('sign-up-success', {
            url: '/sign-up-success',
            templateUrl: 'templates/sign-up-success.html'
        })
        .state('forgot-password', {
            url: '/forgot-password',
            templateUrl: 'templates/forgot-password.html'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/chats');

});
