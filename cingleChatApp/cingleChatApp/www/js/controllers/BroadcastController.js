// controlador para los broadcasts
MainController.controller('BroadcastController', function($scope, $timeout) {
    // datos del form
    $scope.formData = {
        // indica a quien va dirigido el broadcast. posibles valores: 'gender' (default) | 'email_list'
        broadcastTo: 'gender',
        // indica a que género enviar el broadcast. posibles valores: 'm' (default) | 'f' | 'mf' (ambos generos)
        genderTo: 'mf',
        // lista de emails
        emailList: '',
        // mensaje en español
        spanishMessage: '',
        // mensaje en ingles
        englishMessage: ''
    }

    // Variable que maneja el texto del botón send
    $scope.sendBroadcastButton = {
        loading: false,
        loadingText: 'Sending...',
        defaultText: 'Send',
        currentText: 'Send',
        doneText: 'Done!'
    }
    
    /**
    *   Función responsable de enviar un broadcast
    */
    $scope.sendBroadcast = function () {
        // recurso a donde se enviará el mensaje
        var resource = ''
        var params = {}

        // Enviando
        $scope.sendBroadcastButton.loading = true
        $scope.sendBroadcastButton.currentText = $scope.sendBroadcastButton.loadingText

        // se valida a donde se quiere enviar el mensaje
        if ($scope.formData.broadcastTo == 'gender') {
            // depende del genero se cambia el recurso
            switch($scope.formData.genderTo) {
                case 'm':
                    resource = 'enviar_hombres'
                break;
                case 'f':
                    resource = 'enviar_mujeres'
                break;
                case 'mf':
                    resource = 'enviar_unisex'
                break;
                default:
                    resource = 'undefined'
                break;
            }

            params = {
                mensaje_ingles: $scope.formData.englishMessage,
                mensaje_espanol: $scope.formData.spanishMessage
            }
        } else if ($scope.formData.broadcastTo == 'email_list') {
            resource = 'enviar_lista'
            params = {
                mensaje_ingles: $scope.formData.englishMessage,
                mensaje_espanol: $scope.formData.spanishMessage,
                listado: $scope.formData.emailList
            }
        }

        console.log('resource');
        console.log(resource);
        console.log('params');
        console.log(params);

        // se envia el mensaje al recurso 
        $scope.restangular.one(resource, '')
            .post('', {}, params).then(function(response) {
                // se valida el código de respuesta
                if (response.status === 200) {
                    console.log('done');
                    console.log(response.data);
                    // Enviado!
                    $scope.formData.englishMessage = ''
                    $scope.formData.spanishMessage = ''
                    $scope.formData.emailList = ''
                    $scope.sendBroadcastButton.currentText = $scope.sendBroadcastButton.doneText

                    // se espera un tiempo para que se alcance a ver el flujo
                    $timeout(function() {
                        $scope.sendBroadcastButton.loading = false
                        $scope.sendBroadcastButton.currentText = $scope.sendBroadcastButton.defaultText
                    }, 1000)
                } else {
                    console.log('Error')
                }
            }, function(error) {
                console.log('Error trying to send a broadcast. Error: ');
                console.log(error);
            })
    }


    /**
    *   Función responsable de indicar a quién va dirigido un broadcast
    */
    $scope.setBroadcastTo = function (broadcastToNew) {
        $scope.formData.broadcastTo = broadcastToNew
    }

    /**
    *   Función responsable de indicar a qué género se debe enviar el broadcast
    */
    $scope.setGender = function (genderToNew) {
        $scope.formData.genderTo = genderToNew
    }
})
