// contenedor de los controladores
var MainController = angular.module('MainController', []);

// controlador principal de la app
MainController.controller('MainController', function($rootScope, $scope, $ionicModal, $ionicScrollDelegate, Restangular, CONSTANTS, $interval, $state, $timeout, $cordovaVibration, $ionicLoading, $ionicContentBanner, $q) {
    // se configura restangular de forma global
    $scope.restangular = Restangular
    // constantes
    $scope.constants = CONSTANTS
    // indica cada cuanto se consulta por nuevos mensajes
    $scope.intervalSeconds = 30
    // Lista de usuarios de la app
    $scope.users = []
    // información de los usuarios de cingle
    $scope.usersData = {
        total: 0,
        lastPage: 0,
        currentPage: -1, // se hace para que la primera vez que se soliciten datos se puedan traer
        // variable que indica el ultimo texo por el cual busco un usuario, se oloca cualquier cosa 
        // como valor con tal de que no coincida inicialmente con la var 'termino'
        terminoPrev: '----cingle----'
    }
    // Parámetros para obtener los usuarios de cingle
    $scope.userDataParams = {
        page: 1,
        item_order: 'users.nombre',
        asc_desc: 'asc',
        termino: '' // texto para filtrar usuarios
    }
    // variable que indica si se debe notificar al usuario o no
    $scope.shouldNotify = false
    // listado de chats activo del usuario
    $scope.chats = []
    // cantidad de mensajes sin leer
    $scope.unreadChatsAmount = 0
    // variable que guarda la última página obtenida de chats activos
    $scope.chatsParams = {
        page: 1
    }
    // primera página de chats activos
    $scope.chatsFirstPage = []
    // información de la paginacion de los chats
    $scope.chatsPagination = {
        total: 0,
        current_page: -1,
        last_page: 0
    }

    var chatsInverval
    var chatsInvervalIndex = 0

    // Función global para realizar un back en cualquier pantalla
    $scope.goToChatList = function() {
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)

        $timeout(function () {
            window.localStorage.setItem('currentUserIdChat', 0)
            $state.go('chats').then(function () {
                $scope.scrollTop()
                $ionicLoading.hide()
            })
        }, 300)
    }
    // Función global para realizar un back en cualquier pantalla
    $scope.historyBack = function() {
        window.localStorage.setItem('currentUserIdChat', 0)
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)
        window.history.back()
    }
    
    // función global para realizar scroll bottom en cualquier pantalla
    $scope.scrollBottom = function() {
        console.log('scrollBottom...');
        $ionicScrollDelegate.scrollBottom();
    }

    // función global para realizar scroll top en cualquier pantalla
    $scope.scrollTop = function() {
        console.log('scrollTop...');
        $ionicScrollDelegate.scrollTop();
    }

    /**
    *   Función que se ejecuta cuando es tocada una inapp-notification
    */
    $rootScope.goToNotification = function (userId, agentId) {
        console.log('goToNotification')
        console.log('userId: ' +  userId);
        console.log('agentId: ' +  agentId);
        // loading...
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)
        // se esconde el div que muestra la notificación
        $rootScope.notification.style.display = "none"; // block | none

        $timeout(function () {
            $state.go('chats-detail', {
                userId: userId,
                agentId: agentId
            })
        }, 300)
    }

    /**
    *   Función que es llamada cuando se omite una notificacion intencionalmente
    */
    $rootScope.skipNotification = function () {
        console.log('skipNotification...');
        //$rootScope.notification.style.display = "none"; // block | none

        var options = {
            translateY: 120,
            delayOut: '0s',
            durationOut: '0.3s'
        }

        move($rootScope.notification)
            .ease('in-out')
            .y(options.translateY * -1)
            .delay(options.delayOut)
            .duration(options.durationOut)
            .end(function () {
                console.log('skip notification done');
            });
    }

    /**
    *   Función responsable de verificar si un deviceToken ya ha sido almacenado en el server
    */
    var checkDeviceToken = function (deviceToken) {
        console.log('checkDeviceToken...')
        var deferred = $q.defer();

        // se consultan los tokens actuales del servidor
        $scope.restangular.one('obtener_tokens')
            .get()
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    // tokens almacenados en el server
                    var currentDeviceTokens = response.data
                    var keysObj = Object.keys(currentDeviceTokens)

                    // indica si se ha encontrado o no el token
                    var isFound = false

                    for (var i = 0; !isFound && (i < keysObj.length); i++) {
                        console.log('currentDeviceTokens[i].token:', currentDeviceTokens[i].token)
                        console.log('deviceToken:', deviceToken)
                        // se valida si el token que llega como parámetro es igual a alguno de la lista
                        if (currentDeviceTokens[i].token === deviceToken) {
                            // token encontrado
                            isFound = true
                            console.log('encontrado!');
                        }
                    }

                    deferred.resolve(isFound)
                } else {
                    console.log('Error getting devices token')
                    deferred.reject('Error getting devices token')
                }
            }, function(error) {
                console.log('Error getting devices token. Error: ');
                console.log(error)
                deferred.reject(error)
            })

        return deferred.promise
    }

    /**
    *   Función responsable de almacenar un deviceToken en el servidor para
    *   usarlo cuando se vaya a enviar notificaciones a los usuarios   
    */
    var saveDeviceToken = function (deviceToken) {
        // se busca la primera página en busca de nuevos mensajes de los usuarios
        checkDeviceToken(deviceToken).then(function (exists) {
            // se verifica si el token ya existe
            if (!exists) {
                console.log('guardar token, no existe')
                var params = {
                    token: deviceToken
                }
                // Se guarda el token
                $scope.restangular.one('guardar_token', '')
                .post('', {}, params).then(function(response) {
                        // se valida el código de respuesta
                        if (response.status === 200) {
                            console.log('deviceToken saved!! %s', deviceToken);
                        } else {
                            console.log('Error savind deviceToken')
                        }
                    }, function(error) {
                        console.log('Error savind deviceToken. Error: ');
                        console.log(error);
                    })
            } else {
                console.log('el token ya existe. %s', deviceToken)
            }
        })
    }

    /**
    *   Función responsable de indicar si un usuario es o no agente de cingle
    */
    $scope.isCingleAgent = function (userId) {
        return (userId == CONSTANTS.USERS.NICOLE.CODE || userId == CONSTANTS.USERS.DAVID.CODE)
    }

    /**
    *   Función responsable de obtener la imagen conrrespondiante a un agente de la app
    */
    $scope.getAgentPathImg = function (userId) {
        // path de la imagen del agente
        var pathImage = ''

        // validamos si es Nicole
        if (userId == CONSTANTS.USERS.NICOLE.CODE) {
            pathImage = 'img/nicole.png'
        } else if (userId == CONSTANTS.USERS.DAVID.CODE) {
            pathImage = 'img/david.png'
        }

        return pathImage
    }

    /**
     *   Función responsable de iniciar un interval que consulta frecuentemente por nuevos chats
     */
    var startChatsInterval = function() {
        // Don't start a new interval if we are already chatting
        if (angular.isDefined(chatsInverval)) return;

        chatsInverval = $interval(function() {
            console.log('chatsInterval...');
            // se verifica si hay nuevos chats
            $scope.checkNewChats(false)
            // se lleva un registro de cuantas veces ha corrido el interval
            chatsInvervalIndex++
        }, $scope.intervalSeconds * 1000);
    }

    /**
     *   Función responsable de cancelar el intervalo que consulta por nuevos chats
     */
    var stopChatsInterval = function() {
        if (angular.isDefined(chatsInverval)) {
            $interval.cancel(chatsInverval);
            chatsInverval = undefined;
        }
    }

    // función que se ejecuata cuando se carga el controlador principal de la aplicación
    $scope.init = function() {
        // se obtienen los usuarios registrados en la app
        startChatsInterval()
    }

    // función que se ejecuata cuando se carga el controlador
    $scope.initChatController = function() {
        console.log('initChatController!')
        // se obtiene la cantidad de chats activos sin leer de
        $scope.getUnreadChatsAmount()
        // se obtiene el listado de chats
        $scope.getUsersChatHistory()
    }

    $scope.nada = function () {
        console.log('NADA!!');
        console.log($scope.userDataParams);
    }

    /**
     *   Función responsable de obtener el listado de usuarios
     */
    $scope.getUsers = function() {
        console.log('getUsers...');
        console.log($scope.userDataParams);

        // loading...
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)

        var isNewSearch = false
        // validamos si esta buscando un usuario y ha cambiado el termino de búsqueda
        if ($scope.isSearching && ($scope.userDataParams.termino != $scope.userDataParams.terminoPrev)) {
            // es una nueva busqueda
            isNewSearch = true
            // se coloca el scroll al top
            $scope.scrollTop()

            // se indica buscar por la primera pagina
            $scope.userDataParams.page = 1,
            $scope.userDataParams.item_order = 'users.nombre',
            $scope.userDataParams.asc_desc = 'asc'

            $scope.usersData = {
                total: 0,
                lastPage: 0,
                currentPage: -1 // se hace para que la primera vez que se soliciten datos se puedan traer
            }
        }

        // se realiza la petición http par aobtener los usuarios
        $scope.restangular.all('user').customGET('', $scope.userDataParams)
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    // se almacena el último termino por el cual se buscó
                    $scope.userDataParams.terminoPrev = $scope.userDataParams.termino

                    // si es la primera página, se resetean los users
                    if ($scope.usersData.currentPage === -1 || isNewSearch) {
                        $scope.users = []
                    }

                    // se mantiene en memoria la información de los usuarios
                    $scope.usersData = {
                        total: response.data.total,
                        lastPage: response.data.lastPage,
                        currentPage: response.data.currentPage
                    }
                    
                    // se asigna el listado de usuarios
                    $scope.users = $scope._.union($scope.users, response.data.items)
                    // se aumenta la página para la siguiente búsqueda
                    $scope.userDataParams.page++;
                    // se informa al infinite-scroll que la información ha cargado
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } else {
                    console.log('Error')
                }
                // hide loading...
                $ionicLoading.hide()
            }, function(error) {
                // hide loading...
                $ionicLoading.hide()
                console.log('Error getting users. Error: %s', error);
                console.log('Error')
            })
    }

    /**
    *   Función que se ejecuta cuando el usuario hace scroll, entonces se requieren cargar más usuarios
    */
    $scope.loadMoreUsers = function () {
        console.log('loadMoreUsers... page: %s', $scope.userDataParams.page);
        if ($scope.moreUsersCanBeLoaded()) {
            $scope.getUsers()
        } else {
            console.log('NO more users.');
        }
    }
    
    /**
    *   Función responsable de verificar si se pueden cargar más usuarios cuando se haga scroll
    */
    $scope.moreUsersCanBeLoaded = function () {
        console.log('moreUsersCanBeLoaded... %s < %s', $scope.usersData.currentPage, $scope.usersData.lastPage)
        // variable que indica si se pueden o no cargar más usuarios
        var moreUsersCanBeLoaded = false

        // Si NO es la última página, entonces se pueden cargar más usuarios
        if ($scope.usersData.currentPage < $scope.usersData.lastPage) {
            moreUsersCanBeLoaded = true
        }
        console.log(moreUsersCanBeLoaded)
        return moreUsersCanBeLoaded
    }

    /**
    *   Función que se ejecuta cuando el usuario hace scroll, entonces se requieren cargar más chats
    */
    $scope.loadMoreChats = function () {
        console.log('loadMoreChats... page: %s', $scope.chatsParams.page);
        if ($scope.moreChatsCanBeLoaded()) {
            // se pueden cargar más chats, entonces se cargan
            $scope.getUsersChatHistory()
        } else {
            console.log('NO more chats.');
        }
    }
    
    /**
    *   Función responsable de verificar si se pueden cargar más usuarios cuando se haga scroll
    */
    $scope.moreChatsCanBeLoaded = function () {
        console.log('moreChatsCanBeLoaded... %s < %s', $scope.chatsPagination.current_page, $scope.chatsPagination.last_page)
        // variable que indica si se pueden o no cargar más chats
        var moreChatsCanBeLoaded = false

        // Si NO es la última página, entonces se pueden cargar más chats
        if ($scope.chatsPagination.current_page < $scope.chatsPagination.last_page) {
            moreChatsCanBeLoaded = true
        }
        console.log(moreChatsCanBeLoaded)
        return moreChatsCanBeLoaded
    }


    /**
    *   Función responsable de validar si dos arrays son iguales elemento a elemento
    */
    $scope.isArrayEquals = function (arr1, arr2) {
        // validamos que sean arrays
        if (!$scope._.isArray(arr1) || !$scope._.isArray(arr2)) {
            console.log('DIFERENTES NO SON ARRAYS');
            return false
        }

        // validamos que tengan la misma cantidad de elmentos
        if (arr1.length != arr2.length) {
            // nuevo mensaje
            $scope.shouldNotify = true
            console.log('DIFERENTES NO TIENEN LA MISMA LONG');
            console.log(arr1.length);
            console.log(arr2.length);
            return false
        }

        var elemI
        var elemJ
        // ahora validamos elemento a elemento del array
        for (var i = 0; i < arr1.length; i++) {
            elemI = {
                id: arr1[i].id,
                user_p: arr1[i].user_p,
                user_s: arr1[i].user_s,
                visto: arr1[i].visto,
                mensaje: arr1[i].mensaje,
                created_at: arr1[i].created_at,
            }

            elemJ = {
                id: arr2[i].id,
                user_p: arr2[i].user_p,
                user_s: arr2[i].user_s,
                visto: arr2[i].visto,
                mensaje: arr2[i].mensaje,
                created_at: arr2[i].created_at,
            }

            // validamos si el elemento i de arr1 es igual al elemento i de arr2
            if (!$scope._.isEqual(elemI, elemJ)) {
                // si el chat es diferente porque david o nicole enviaron un mensajes, entonces no se notifica al usuario
                if (!(elemI.user_p == CONSTANTS.USERS.NICOLE.CODE || elemI.user_p == CONSTANTS.USERS.DAVID.CODE)) {
                    $scope.shouldNotify = true
                }
                console.log('DIFERENTES EN EL ELEMENTO i. Notificar? ', $scope.shouldNotify);
                console.log(arr1[i]);
                console.log(arr2[i]);
                return false
            }
        }
        console.log('NO HAY NUEVOS MENSAJES');
        return true
    }

    // variable temporal para guardar el listado de chats y luego compararlo con el actual, de ser diferentes se actualiza el actual
    $scope.chatsTemp = []

    /**
    *   Función responsable de verificar si hay o no nuevos mensajes de los usuarios
    */
    $scope.checkNewChats = function (isRefresh) {
        // se muestra el loading si es un refresh intencional
        if (isRefresh) {
            // loading...
            $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)
        }

        // se busca la primera página en busca de nuevos mensajes de los usuarios
        $scope.restangular.one('listall').get({
            page: 1
        }).then(function(response) {
            // se valida el código de respuesta
            if (response.status === 200) {
                // se obtiene la primera pagina del listado de chats
                var chatsFirstPageCurrent = ($scope._.isArray(response.data.mensajes)) ? response.data.mensajes : []

                // if ($scope.chats.length) {
                //     chatsFirstPageCurrent[0].user_p  = "11"
                //     chatsFirstPageCurrent[0].mensaje = "Hola " + Math.random()
                // }

                // se valida si la primera página es diferente a la que se acaba de obtener, de ser asi entonces 
                // es porque hay nuevos mensajes
                if (!$scope.isArrayEquals($scope.chatsFirstPage, chatsFirstPageCurrent)) {
                    // se actualiza el valor de la primera página y de los chats totales
                    $scope.chats = chatsFirstPageCurrent
                    $scope.chatsFirstPage = chatsFirstPageCurrent

                    // se valida si esta disponible el componente de vibración
                    if ($cordovaVibration && $scope.shouldNotify) {
                        // vobración
                        $cordovaVibration.vibrate(500)
                        // se cambia la bandera de notificación a su estado original
                        $scope.shouldNotify = false
                        // se coloca el scroll al top
                        // $scope.scrollTop()
                        // se consulta por nuevos mensajes
                        $scope.getUnreadChatsAmount()
                    }
                 }
            } else {
                console.log('Error chacking new messages')
            }

            // hide loading...
            $ionicLoading.hide()
            
            // si el usuario esta haciendo refresh, se emite el evento de que ya se termino el proceso
            if (isRefresh) {
                console.log('OK REFERSH');
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete')
            } else {
                console.log('WAS NO REFERSH');
            }
        }, function(error) {
            if (isRefresh) {
                // hide loading...
                $ionicLoading.hide()
                console.log('OK REFERSH');
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete')
            } else {
                console.log('WAS NO REFERSH');
            }

            console.log('Error getting user chat history. Error: %s', error);
            console.log('Error')
        })
    }

    /**
     *   Función responsable de obtener el listado de chats actuales
     */
    $scope.getUsersChatHistory = function() {
        // loading...
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)

        // se realiza la petición http par aobtener el historial de chat del usuario
        $scope.restangular.one('listall').get($scope.chatsParams)
            .then(function(response) {
                console.log('getUsersChatHistory')
                console.log(response.data)

                // se valida el código de respuesta
                if (response.status === 200) {
                    // si es la primera página, se resetean los users
                    if ($scope.chatsParams.page === 1) {
                        $scope.chats = []
                    }

                    // se mantiene en memoria la información de paginación de los chat
                    $scope.chatsPagination = response.data.pagination
                    
                    // se asigna el listado de chats
                    $scope.chats = $scope._.union($scope.chats, response.data.mensajes)
                    console.log('$scope.chats')
                    console.log($scope.chats)


                    // se aumenta la página para la siguiente búsqueda
                    $scope.chatsParams.page++;

                    // se informa al infinite-scroll que la información ha cargado
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } else {
                    console.log('Error getting chats')
                }

                // hide loading...
                $ionicLoading.hide()
            }, function(error) {
                // hide loading...
                $ionicLoading.hide()
                console.log('Error getting user chats. Error:');
                console.log(error)
            })
    }

    /**
     *   Función responsable de obtener la cantidad de chats sin leer
     */
    $scope.getUnreadChatsAmount = function() {
        // se realiza la petición http para obtener la cantidad de chats sin leer
        $scope.restangular.one('sinleeradmin').get()
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    console.log('sin leer: ')
                    console.log(response.data);

                    // se valida si los mensajes sin leer recien consultados son diferentes a los que se tienen en
                    // memoria, de ser asi entonces se actualizan los de memoria
                    if ($scope.unreadChatsAmount != response.data.sin_leer) {
                        $scope.unreadChatsAmount = response.data.sin_leer
                    }
                } else {
                    console.log('Error response. status: %s', response.status)
                }
            }, function(error) {
                console.log('Error getting amount unread chats. Error:');
                console.log(error)
            })
    }

    // variable que indica si se tiene o no abierto el modal de busqueda
    $scope.isSearching = false;

    // search modal
    $ionicModal.fromTemplateUrl('templates/modal/search.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.searchModal = modal;
    });
    $scope.openSearchUser = function() {
        // variable que indica el ultimo texo por el cual busco un usuario, se oloca cualquier cosa 
        // como valor con tal de que no coincida inicialmente con la var 'termino'
        $scope.userDataParams.terminoPrev = '----cingle----'
        $scope.isSearching = true;
        $scope.getUsers()
        $scope.searchModal.show();
    };
    $scope.closeSearchUser = function() {
        // se limpia la busqueda
        $scope.userDataParams.termino = ''
        $scope.isSearching = false;
        $scope.searchModal.hide();
    };

    // envia al usuario a la pantalla de broadcast
    $scope.goToBroadcast = function() {
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)

        $timeout(function () {
            $state.go('broadcast')
        }, 500)
    };

    // evento para abrir una notificacion
    $scope.$on('goToNotificationEvent', function (event, data) {
        console.log('goToNotificationEvent')
        $rootScope.goToNotification(data.userId, data.agentId)
    });

    // listen for the event in the relevant $scope
    $scope.$on('saveDeviceTokenEvent', function (event, data) {
        console.log('saveDeviceTokenEvent')
        saveDeviceToken(data.deviceToken)
    });

    // evento que se lanza cuando hay una nueva notificacion
    $scope.$on('onNotificationEvent', function (event, data) {
        console.log('onNotificationEvent')
        // ha llegado una notificaciochats
        $scope.checkNewChats(false)
    });

    $scope.$on('$stateChangeStart', function() {
        if ($scope.searchModal) {
            $scope.closeSearchUser();
        }
        
    });

    $scope.$on('$destroy', function() {
        // nos aseguramos que el intervalo se detenga
        stopChatsInterval();
    });

})
