// controlador para los broadcasts
MainController.controller('BroadcastController', function($scope) {
    // indica a quien va dirigido el broadcast. posibles valores: 'gender' (default) | 'email_list'
    $scope.broadcastTo = 'gender'
    // indica a que género enviar el broadcast. posibles valores: 'm' (default) | 'f' | 'mf' (ambos generos)
    $scope.genderTo = 'mf'

    /**
    *   Función responsable de indicar a quién va dirigido un broadcast
    */
    $scope.setBroadcastTo = function (broadcastToNew) {
        $scope.broadcastTo = broadcastToNew
    }

    /**
    *   Función responsable de indicar a qué género se debe enviar el broadcast
    */
    $scope.setGender = function (genderToNew) {
        $scope.genderTo = genderToNew
    }
})
