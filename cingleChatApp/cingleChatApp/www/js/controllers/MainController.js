// contenedor de los controladores
var MainController = angular.module('MainController', []);

// controlador principal de la app
MainController.controller('MainController', function($scope, $ionicModal) {
    $scope.historyBack = function() {
        window.history.back();
    };

    // listado de usuarios
    $scope.users = [{
        id: "123456",
        nombre: "Nicole",
        apellido: "Moreno",
        email: "nicolemoreno@cingleapp.com",
        edad: "0",
        sexo: "F",
        idioma: "ES",
        photo: "http://graph.facebook.com/10154132182603535/picture?type=square"
    }, {
        id: "123456",
        nombre: "Juan",
        apellido: "Cuenca",
        email: "juanc@cingleapp.com",
        edad: "0",
        sexo: "M",
        idioma: "EN",
        photo: "http://graph.facebook.com/10154161233547953/picture?type=square"
    }]

    // new-chat modal
    $ionicModal.fromTemplateUrl('templates/modal/new-chat.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newChatmodal = modal;
    });
    $scope.openNewChat = function() {
        $scope.newChatmodal.show();
    };
    $scope.closeNewChat = function() {
        $scope.newChatmodal.hide();
    };

    $ionicModal.fromTemplateUrl('templates/modal/search.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.searchModal = modal;
    });
    $scope.openSearch = function () {
        $scope.searchModal.show();

    };
    $scope.closeSearch = function () {
        $scope.searchModal.hide();
    };


    $scope.$on('$stateChangeStart', function() {
        if ($scope.newChatmodal) {
            $scope.closeNewChat();
        }
    });


})
