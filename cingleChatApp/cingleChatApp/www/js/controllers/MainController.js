// contenedor de los controladores
var MainController = angular.module('MainController', []);

// controlador principal de la app
MainController.controller('MainController', function($rootScope, $scope, $ionicModal, $ionicScrollDelegate, ChatService, Restangular, CONSTANTS, $interval, $state, $timeout) {
    // se configura restangular de forma global
    $scope.restangular = Restangular;

    // Función global para realizar un back en cualquier pantalla
    $scope.historyBack = function() {
        window.history.back()
        $timeout(function() {
            $scope.scrollTop()
        }, 100)

        // el back siempre va a el listado, entonces se resetea el listado de usuarios
        $scope.usersData = {
            total: 0,
            lastPage: 0,
            currentPage: -1, // se hace para que la primera vez que se soliciten datos se puedan traer
            // variable que indica el ultimo texo por el cual busco un usuario, se oloca cualquier cosa 
            // como valor con tal de que no coincida inicialmente con la var 'termino'
            terminoPrev: '----cingle----'
        }
        // se obtienen los usuarios
        $scope.getUsers()
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
    // listado de chats activo del usuario
    $scope.chats = []
    // cantidad de mensajes sin leer
    $scope.unreadChatsAmount = 0
    // cantidad actual de mensajes sin leer, se usa para comparar con los datos obtenidos del server y saber si se necesita actualizar el listado de chats
    $scope.unreadChatsAmountCurrent = 0

    var chatsInverval
    var chatsInvervalIndex = 0

    /**
     *   Función responsable de iniciar un interval que consulta frecuentemente por nuevos chats
     */
    var startChatsInterval = function() {
        // Don't start a new interval if we are already chatting
        if (angular.isDefined(chatsInverval)) return;

        chatsInverval = $interval(function() {
            console.log('chatsInterval...');
            // se consulta por nuevos mensajes
            $scope.getUnreadChatsAmount(CONSTANTS.USERS.NICOLE.CODE)
            // se actualizan los chats
            $scope.getUsersChatHistory(CONSTANTS.USERS.NICOLE.CODE, false)
            // se lleva un registro de cuantas veces ha corrido el interval
            chatsInvervalIndex++
            // cada cierto tiempo se consulta por nuevos usuarios
            console.log('chatsInvervalIndex: ', chatsInvervalIndex);
            // cada minuto se actualizan los usuarios (siempre y cuando no se esta buscando uno)
            if ((chatsInvervalIndex % 12 == 0) && !$scope.isSearching) {
                console.log('update users from interval...');
                $scope.usersData = {
                    total: 0,
                    lastPage: 0,
                    currentPage: -1 // se hace para que la primera vez que se soliciten datos se puedan traer
                }

                // se traen los usuarios
                $scope.loadMoreUsers()
            }
        }, 5000);
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
    $scope.initChatController = function(isRefresh) {
        console.log('initChatController!');
        console.log('isRefresh: ', isRefresh);
        // se obtiene la cantidad de chats activos sin leer de "Nicole" y recursivamente de "David"
        $scope.getUnreadChatsAmount(CONSTANTS.USERS.NICOLE.CODE, isRefresh)
        // se actualiza el chat
        $scope.getUsersChatHistory(CONSTANTS.USERS.NICOLE.CODE, isRefresh)
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
            }, function(error) {
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

        // Si es la última página, entonces se pueden cargar más usuarios
        if ($scope.usersData.currentPage < $scope.usersData.lastPage) {
            moreUsersCanBeLoaded = true
        }
        console.log(moreUsersCanBeLoaded)
        return moreUsersCanBeLoaded
    }

    /**
     *   Función responsable de obtener el listado de chats activo
     *
     *   @param userId, id del usuario del que se desea obtener el historial de chat
     */
    $scope.getUsersChatHistory = function(userId, isRefresh) {
        console.log('isRefresh??? ', isRefresh);
        // se realiza la petición http par aobtener el historial de chat del usuario
        $scope.restangular.one('chat_list', userId).get()
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    // si ya se pidieron los chats de Nicole, entonces ahora se piden los de David
                    if (userId == CONSTANTS.USERS.NICOLE.CODE) {
                        // se asigna en memoria el listado de chats actual
                        $scope.chats = response.data
                            // se piden los chats de David
                        $scope.getUsersChatHistory(CONSTANTS.USERS.DAVID.CODE, isRefresh)
                    } else if (userId == CONSTANTS.USERS.DAVID.CODE) {
                        // se acaban de consultar el listado de chats de David
                        var chatsDavid = response.data
                        // entonces se combina con el de Nicole que ya estaba y se ordenda
                        $scope.chats = $scope._.sortBy($scope._.union($scope.chats, chatsDavid), 'created_at').reverse()
                        // se valida si es un refresh, de serlo así se emite un broadcast para informar que el evento termina
                        if (isRefresh) {
                            console.log('OK REFRESH');
                            $scope.$broadcast('scroll.refreshComplete');
                        } else {
                            console.log('NO REFRESH');
                        }
                    }
                } else {
                    console.log('Error')
                }
            }, function(error) {
                console.log('Error getting user chat history. Error: %s', error);
                console.log('Error')
            })
    }

    /**
     *   Función responsable de obtener la cantidad de chats activo
     *
     *   @param userId, id del usuario del que se desea obtener la cantidad de chats activos
     */
    $scope.getUnreadChatsAmount = function(userId, isRefresh) {
        // se realiza la petición http par aobtener el historial de chat del usuario
        $scope.restangular.one('sinleer', userId).get()
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    // si ya se pidieron los chats de Nicole, entonces ahora se piden los de David
                    if (userId == CONSTANTS.USERS.NICOLE.CODE) {
                        // se tiene referencia de cuantos mensajes hay sin leer actualmente
                        $scope.unreadChatsAmountCurrent = $scope.unreadChatsAmount

                        // se asigna en memoria el listado de chats actual
                        $scope.unreadChatsAmount = response.data.sin_leer
                        // se piden los chats de David
                        $scope.getUnreadChatsAmount(CONSTANTS.USERS.DAVID.CODE, isRefresh)
                    } else if (userId == CONSTANTS.USERS.DAVID.CODE) {
                        // se acaban de consultar el listado de chats de David
                        var unreadChatsDavidAmount = response.data.sin_leer
                        // entonces se combina con el de Nicole que ya estaba
                        $scope.unreadChatsAmount += unreadChatsDavidAmount
                        console.log('sin leer (server): ', $scope.unreadChatsAmount + ' ' + $scope.unreadChatsAmountCurrent);
                        // se verifica si los mensajes actuales sin leer son menores a los recien consultados en el server,
                        // de ser asi entonce se actualiza el listado de chats
                        if ($scope.unreadChatsAmountCurrent != $scope.unreadChatsAmount) {
                            // se obtiene el listado de chats activos del usuario "Nicole" y recursivamente el de "David"
                            $scope.getUsersChatHistory(CONSTANTS.USERS.NICOLE.CODE, isRefresh)
                        } else {
                            // se valida si es un refresh, de serlo así se emite un broadcast para informar que el evento termina
                            if (isRefresh) {
                                console.log('OK REFRESH');
                                $scope.$broadcast('scroll.refreshComplete');
                            } else {
                                console.log('NO REFRESH');
                            }
                        }
                    }
                } else {
                    console.log('Error')
                }
            }, function(error) {
                console.log('Error getting user chat history. Error: %s', error);
                console.log('Error')
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
        $state.go('broadcast')
    };

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
