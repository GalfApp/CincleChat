// controlador para los chats
MainController.controller('ChatController', function($scope, $stateParams, $q, CONSTANTS, $interval, $ionicListDelegate, $ionicLoading) {
    console.log('ChatController!');
    // chat con un usuario
    $scope.chat = []
    // usuario con el que actualmente se tiene una conversación
    $scope.userToChat = {}
    // código del agente con el que esta chateando el usuario
    $scope.codeAgent = 0
    // Variable que maneja el texto del botón send
    $scope.sendButton = {
        loading: false,
        loadingText: 'Sending...',
        defaultText: 'Send',
        currentText: 'Send'
    }
    // listado de ids de mensajes sin leer
    $scope.unreadMessageList = []
    // indica cada cuantos segundos se consulta por nuevos mensajes
    $scope.intervalSecondsChat = 10

    /**
     *   Función responsable de dados dos ids de usuario, obtener el del usuario de cingle 
     *   y no el del agente (Nicole / David)
     */
    $scope.getCingleUserId = function(userP, userS) {
        var cingleUserId = ''

        // se valida cual de los dos corresponde a un usuario de cingle
        if (!$scope.isCingleAgent(userP)) {
            cingleUserId = userP
        } else if (!$scope.isCingleAgent(userS)) {
            cingleUserId = userS
        }

        return cingleUserId
    }

    /**
     *   Función responsable de crear una nueva conversación
     */
    var createChat = function(userId) {
        console.log('create chat...');

        // Se inicia una conversación
        $scope.restangular.one('create_chat', $scope.codeAgent).one(userId).post()
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    console.log(response.data)
                        // done, chat creado o puede que ya exista.. de cualquier modo se pide el chat actual
                    getChat($stateParams.userId)

                    // se inicia la tarea que concurrentemente esta consultando en el server por nuevos mensajes
                    startChatInterval()
                } else {
                    console.log('Error')
                }
                
                // loading hide...
                $ionicLoading.hide()
            }, function(error) {
                // loading hide...
                $ionicLoading.hide()
                console.log('Error getting user chat history. Error: ');
                console.log(error);
            })
    }

    /**
    *   Función responsable de obtener el listados de messageId para marcar como leidos
    */
    var getUnreadMessages = function () {
        // se recorre todo el listado de mensajes actual para saber cuales son lo que no estan leidos
        angular.forEach($scope.chat, function(message) {
            // se verifica si el mensaje esta o no leido
            if (message.visto == '0') {
                $scope.unreadMessageList.push(message.id)
            }
        });
        console.log('unreadMessageList: ');
        console.log($scope.unreadMessageList);
    }

    /**
    *   Función responsable de marcar un mensaje como leido
    */
    var markMessagesAsRead = function (done) {
        // se verifica si se debe terminar el proceso
        if (done) {
            return
        }

        // Se verifica si el listado de mensajes sin leer esta vacio para actulizarlo
        if ($scope.unreadMessageList.length == 0) {
            // se obtiene el listado de ids de mensaje a marcar como leidos
            getUnreadMessages()

            setTimeout(function() {
                // Si no hay mensajes por marcar como leidos se acaba el proceso
                if ($scope.unreadMessageList.length == 0) {
                    // se indica terminar el proceso
                    markMessagesAsRead(true)
                } else {
                    //  se continúa el proceso de marcar los mensajes como leidos
                    markMessagesAsRead(false)
                }
            }, 100)
        } else {
            // se obtiene el id de mensaje a marcar como leido
            var messageId = $scope.unreadMessageList[0]
            console.log('Marcando como leido: ', messageId);

            // Se marca el mensaje como leido
            $scope.restangular.one('message', messageId)
                .post('', {}, {
                    visto: '1'
                }).then(function(response) {
                    // se valida el código de respuesta
                    if (response.status === 200) {
                        console.log('DONE');
                        console.log(response.data)
                        // se elimina el index que ya se marco como leido 
                        $scope.unreadMessageList.splice(0, 1)

                        // se verifica si hay mas mensajes para marcar como leidos
                        if ($scope.unreadMessageList.length == 0) {
                            // se acaba el proceso
                            markMessagesAsRead(true)
                        } else {
                            // Se hace una llamada recursiva para seguir marcando como leidos los demas mensajes
                            markMessagesAsRead(false)
                        }
                    } else {
                        console.log('Error')
                    }
                }, function(error) {
                    console.log('Error trying to mark a message as read. Error: ');
                    console.log(error);
                })
        }
    }


    /**
     *   Función responsable de obtener una conversación
     */
    var getChat = function(userId, userSex) {
        console.log('get chat...');
        var currentMessages = $scope.chat.length

        // Se obtiene la conversación
        $scope.restangular.one('chat_history', $scope.codeAgent).customGET(userId)
            .then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    // se asigna en memoria el listado de chats actual
                    console.log('conversacion');
                    console.log(response.data)
                    // se valida si hay mensajes nuevos
                    if (response.data.length > currentMessages) {
                        $scope.chat = response.data
                        // se hace scroll para que se vea el último mensaje
                        $scope.scrollBottom()
                        // se marcan los mensajes como leidos
                        markMessagesAsRead(false)
                    }
                } else {
                    console.log('Error')
                }
            }, function(error) {
                console.log('Error getting chat. Error: ');
                console.log(error);
            })
    }

    /**
     *   Función responsable de obtener la información del usuario con el que se va a chatear
     */
    $scope.getUserData = function(userId) {
        // se retorna una promesa, no sabemos si se puede obtener la info del usuario o no
        return $q(function(resolve, reject) {
            // validamos si llega un id
            if (userId) {
                $scope.restangular.all('user').customGET(userId)
                    .then(function(response) {
                        console.log('User data:');
                        console.log(response);
                        // se valida el código de respuesta
                        if (response.status === 200) {
                            // se valida si el usuario llega en la posición 0 del arreglo de respuesta que llega
                            if (response.data.length == 1) {
                                // llego la info
                                // se mantiene en memoria la información del usuario
                                $scope.userToChat = response.data[0]
                                resolve(true)
                            } else {
                                // error, no se pudo obtener el usuario
                                reject('userId "%s" invalid', userId)
                            }

                        } else {
                            reject('Error. status response error: %s', response.status)
                        }
                    }, function(error) {
                        console.log('Error getting users. Error: %s', error);
                        reject('Error: %s', error)
                    })
            } else {
                reject('UserId null or undefined')
            }
        })
    }

    var chatInverval;

    /**
     *   Función responsable de iniciar un interval que consulta frecuentemente por nuevos mensajes
     *   del usuario con el que se esta chateando.
     */
    var startChatInterval = function() {
        // Don't start a new interval if we are already chatting
        if (angular.isDefined(chatInverval)) return;

        chatInverval = $interval(function() {
            console.log('interval...');
            getChat($stateParams.userId)
        }, $scope.intervalSecondsChat * 1000);
    }

    /**
     *   Función responsable de cancelar el intervalo que consulta por nuevos mensajes en el servidor
     */
    var stopChatInterval = function() {
        if (angular.isDefined(chatInverval)) {
            $interval.cancel(chatInverval);
            chatInverval = undefined;
        }
    }


    /**
     *   Función que se ejecuta cada vez que se ingresa en una conversación
     */
    $scope.initChat = function() {
        console.log('init chat')
        console.log('Params:');
        console.log($stateParams)

        // loading...
        $ionicLoading.show(CONSTANTS.LOADING.OPTIONS)

        // se valida si se debe crear una nueva conversación o si es una ya 
        if ($stateParams.userId) {
            // se consulta la información del usuario a chatear, si existe el usuario se empieza un chat o se consulta el chat ya existente
            var getUserData = $scope.getUserData($stateParams.userId);

            // cuando se obtenga la información del usuario se empieza el chat
            getUserData.then(function(response) {
                console.log('$scope.userToChat.sexo: ', $scope.userToChat.sexo);
                // el codigo del agente depende del sexo del usuario
                $scope.codeAgent = ($scope.userToChat.sexo.toLowerCase() == 'm') ? CONSTANTS.USERS.NICOLE.CODE : CONSTANTS.USERS.DAVID.CODE

                // se intenta crear siempre el chat
                createChat($stateParams.userId)
            }, function(reason) {
                console.log('Error to get the user')
                $scope.historyBack()
            });
        }
    }


    /**
     *   Función responsable de enviar un mensaje
     */
    $scope.sendMessage = function(chatText) {
        // se valida que el mensaje no sea vacío
        if (chatText) {
            // se indica en el boton que se esta enviando el mensaje
            $scope.sendButton.loading = true
            $scope.sendButton.currentText = $scope.sendButton.loadingText

            // Se envía un mensaje
            $scope.restangular.one('send_message', $scope.codeAgent).all($scope.userToChat.id)
                .post('', {
                    mensaje: chatText
                }).then(function(response) {
                    // se valida el código de respuesta
                    if (response.status === 200) {
                        console.log(response.data)
                        // se obtiene el chat actualizado
                        getChat($stateParams.userId)
                    } else {
                        console.log('Error')
                    }

                    // La acción ha terminado
                    $scope.sendButton.loading = false
                    $scope.sendButton.currentText = $scope.sendButton.defaultText
                }, function(error) {
                    console.log('Error getting user chat history. Error: ');
                    console.log(error);
                    // La acción ha terminado
                    $scope.sendButton.loading = false
                    $scope.sendButton.currentText = $scope.sendButton.defaultText
                })
        } else {
            console.log('Error: Empty message');
        }
    }

    /**
    *   function responsable de eliminar un chat
    */
    $scope.removeChat = function(chat, index) {
        // se valida que existan los ids para eliminar el chat
        if (chat.user_p && chat.user_s) {
            // Se elimina el chat
            $scope.restangular.one('delete_chat', chat.user_p).all(chat.user_s)
                .post('', {})
                .then(function(response) {
                    // se valida el código de respuesta
                    if (response.status === 200) {
                        console.log('Chat Eliminado...');
                        // se elimina de memoria el index
                        $scope.chats.splice(index, 1)
                        // se actualiza el listado de chats
                        $scope.getUnreadChatsAmount(CONSTANTS.USERS.NICOLE.CODE, false)
                    } else {
                        console.log('Error')
                    }
                }, function(error) {
                    console.log('Error deleting. Error: ');
                    console.log(error);
                })
        }
    };

    /**
    *   function responsable de limpiar un chat
    */
    $scope.clearChat = function(chat, index) {
        // se valida que existan los ids para eliminar el chat
        if (chat.user_p && chat.user_s) {
            // Se elimina el chat
            $scope.restangular.one('clear_chat', chat.user_p).all(chat.user_s)
                .post('', {})
                .then(function(response) {
                    // se valida el código de respuesta
                    if (response.status === 200) {
                        console.log('Chat clean...');
                        // Se limpia el ultimo mensaje
                        $scope.chats[index].mensaje = ''
                        // se actualiza el listado de chats
                        $scope.getUnreadChatsAmount(CONSTANTS.USERS.NICOLE.CODE, false)

                        // se ocultan los botones que parecen cuando se hizo swipe
                        $ionicListDelegate.closeOptionButtons()
                    } else {
                        console.log('Error')
                    }
                }, function(error) {
                    console.log('Error deleting. Error: ');
                    console.log(error);
                })
        }
    };

    // function responsable de abrir la UI para enviar broadcast
    $scope.newBroadcastChat = function() {

    }

    $scope.$on('$stateChangeSuccess', function() {
        $scope.loadMoreUsers();
    });

    $scope.$on('$destroy', function() {
        // nos aseguramos que el intervalo se detenga
        stopChatInterval();
    });
})
