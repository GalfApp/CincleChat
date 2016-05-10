// contenedor de los servicios
var ChatService = angular.module('ChatService', []);

// Declare factory
ChatService.factory('ChatService', function(Restangular) {

	var chatServices = {
		// función reponsable de retornar el objeto rest para consultar el listado de chats activos
		chatList: function () {
			return Restangular.service('users');
		}
	}
  	
  	return chatServices
});