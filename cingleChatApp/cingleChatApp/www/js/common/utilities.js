/**
 *  Script que contiene utilidades generales de la aplicación.
 *
 *  @author Sebastián Lara <jhoansebastianlara@gmail.com>
 *
 *  @created 07/05/2016
 */

var utilities = angular.module('utilities', [])

utilities.factory('utilities', [
    function() {
        var utilities = {
        	/**
			*	Función responsable de obtener la cantidad de tiempo que ha pasado desde 
			*	una fecha específica que llega por parámetro
			*/
            getPassedTime: function(untilDate) {
                var response = '-'

                // se valida que llegue una fecha válida
                if (moment(untilDate).isValid()) {
                    untilDate = untilDate.replace(' ', 'T')
                    var now = moment().format('YYYY-MM-DDTHH:mm:ss')
                    var untilDateDuration = moment(untilDate)

                    var minutes = moment(now).diff(untilDateDuration, 'minutes')
                    var hours = moment(now).diff(untilDateDuration, 'hours')
                    var days = moment(now).diff(untilDateDuration, 'days')
                    var weeks = moment(now).diff(untilDateDuration, 'weeks')

                    if (minutes < 1) {
                        response = 'Just now'
                    } else if (minutes < 60) {
                        response = minutes + 'm'
                    } else if (hours < 24) {
                        response = hours + 'h'
                    } else if (days < 30) {
                        response = days + 'd'
                    } else {
                        response = weeks + 'w'
                    }
                }

                return response
            }


        }

        return utilities
    }
])
