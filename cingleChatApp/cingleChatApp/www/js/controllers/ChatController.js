// controlador para los chats
MainController.controller('ChatController', function($scope) {
    // cantidad de chats sin leer
    $scope.unreadChatsAmount = 1

    // listado de chats
    $scope.chats = [{
        id: "new",
        nombres: [{
            nombre: "David",
            apellido: "Never"
        }],
        visto: "0",
        mensaje: "Hola soy un mensaje",
        foto: [{
            foto: "https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/12359895_10153818584357953_6669667907787309119_n.jpg?oh=9425363696b38d2b528c0a27f86f2a8c&oe=57A61EF5"
        }]
    }, {
        id: "123456",
        nombres: [{
            nombre: "David",
            apellido: "Never"
        }],
        visto: "1",
        mensaje: "Hola soy un mensaje",
        foto: [{
            foto: "https://scontent.xx.fbcdn.net/hphotos-xpf1/v/t1.0-9/12359895_10153818584357953_6669667907787309119_n.jpg?oh=9425363696b38d2b528c0a27f86f2a8c&oe=57A61EF5"
        }]
    }]

    $scope.chat = {
        hola: 'hola',
        user: {
            id: "123456",
            nombre: "Nicole",
            apellido: "Moreno",
            email: "nicolemoreno@cingleapp.com",
            edad: "0",
            sexo: "F",
            idioma: "ES",
            photo: "http://graph.facebook.com/10154132182603535/picture?type=square"
        }
    }

    $scope.chatList = [{
            id: "0",
            userId: "1",
            chatText: 'I found a great coffee shop.',
            photo: "../img/david.png"
        }, {
            id: "1",
            userId: "1",
            chatText: 'Where is it?',
            photo: "../img/david.png"
        }, {
            id: "2",
            userId: "1",
            chatText: 'Not far from the office building.',
            photo: "../img/david.png"
        }, {
            id: "3",
            userId: "213",
            chatText: 'Shall we go there today?',
            photo: "http://graph.facebook.com/10154132182603535/picture?type=square"
        }]
        // $scope.chats = null;

    // function responsable de eliminar un chat
    $scope.removeChat = function(chat) {

    };

    // function responsable de limpiar un chat
    $scope.clearChat = function(chat) {

    };

    // function responsable de abrir la UI para enviar broadcast
    $scope.newBroadcastChat = function() {

    }

})
