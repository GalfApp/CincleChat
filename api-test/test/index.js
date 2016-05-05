require('./helpers/setup')
    /**
     *  Dependencias
     */
var request = require('supertest');
var host = process.env.TEST_SERVER_HOST || 'http://api.cingleapp.com'
var async = require('async')
var _ = require('lodash')

/**
 *   Locals
 */
request = request(host);

/**
 *  Test
 */
describe('Chats', function() {
    // cantidad de items por página
    var itemsByPageMax = 12
    var NICOLE = 1
    var DAVID = 2
    // id del usuario i que inicia un chat
    var senderId = null
    // id del usuario i con el que se quiere iniciar un chat
    var receiverId = null

    // funcion para validar las propiedades del usuario que llega como parámetro
    var validateUser = function(user) {
        // se validan las propiedades si el usuario no es nulo
        if (!_.isNull(user)) {
            // validamos que el usuario contenga estas propiedades
            expect(user).to.have.property('id')
            expect(user).to.have.property('nombre')
            expect(user).to.have.property('apellido')
            expect(user).to.have.property('email')
            expect(user).to.have.property('sexo')
            expect(user).to.have.property('idioma')
            expect(user.sexo).to.be.oneOf(['M', 'F'])
            // expect(user.idioma).to.be.oneOf(['EN', 'ES'])
        }
    }

    it('Debería realizar la paginación de usuarios, obtener', function(done) {
        var paginationData = {
                page: 1,
                item_order: "users.id"
            }
            // usuarios aleatorios para chatear
        var usersToChat = []

        async.waterfall([
            // se obtiene los usuarios disponibles en la app
            function getPaginatedUsers(callback) {
                console.log('getting page #' + paginationData.page);
                request
                    .get('/user')
                    .set('Accept', 'application/json')
                    .send(paginationData)
                    .expect(200)
                    // .expect('Content-type', /application\/json/)
                    .end(function(err, res) {
                        // se valida si hay un error
                        if (err) {
                            throw new Error(err);
                        }

                        // respuesta del servicio
                        var response = res.body

                        // se asume el peor de los casos, que se esté paginando la última página
                        var isLastPage = true

                        expect(response).to.be.ok

                        expect(response).to.have.property('total')
                        expect(response.total).to.be.a('number')
                            // al menos debe de haber un usuario para poder chatear
                        expect(response.total).to.be.at.least(1)

                        expect(response).to.have.property('lastPage')
                        expect(response.lastPage).to.be.a('number')
                            // si se espera que haya por lo menos un usuario, también debería haber al menos un usuario
                        expect(response.lastPage).to.be.at.least(1)

                        expect(response).to.have.property('currentPage')
                        expect(response.currentPage).to.be.a('number')
                        expect(response.currentPage).to.equal(paginationData.page);

                        // usuarios
                        expect(response).to.have.property('items')
                        expect(response.items).to.be.not.empty

                        // se obtienen números aleatorios para de igual forma obtener aleatoriamente usuarios de la lista
                        var indexRandomA = _.random(0, (response.items.length - 1))
                        var indexRandomB = null

                        // si hay mas de un usuario en la lista se intenta obtener otro usuario
                        if (response.items.length >= 1) {
                            // se obtiene otro número aleatorio (si es igual al primero se escoge otro)
                            do {
                                indexRandomB = _.random(0, (response.items.length - 1))
                            } while (indexRandomA != indexRandomB)
                        }

                        // se toma aleatoriamente un usuario de cada página para validar sus datos
                        var randomUserA = response.items[indexRandomA]
                        var randomUserB = _.isNull(indexRandomB) ? null : response.items[indexRandomB]

                        // validamos que los usuarios contengan las propiedades esperadas
                        validateUser(randomUserA)
                        validateUser(randomUserB)

                        // se guarda la referencia de los usuarios para chatear con ellos mas adelante
                        usersToChat.push(randomUserA)
                        usersToChat.push(randomUserB)

                        // se valida si se está en la última página
                        if (response.lastPage == response.currentPage) {
                            // esta paginando la última página, se calcula la cantidad de items que deberían de haber y se valida
                            var itemsCurrentPageShouldBe = itemsByPageMax - ((response.lastPage * itemsByPageMax) - response.total)

                            expect(response.items).to.have.length(itemsCurrentPageShouldBe);
                        } else if (response.lastPage > 1) {
                            isLastPage = false
                                // hay al menos una página de usuarios y la que se esta paginando no es la última, la cantidad de items
                                // debería ser igual a la cantidad de items máximos por página.
                            expect(response.items).to.have.length(itemsByPageMax);
                        }

                        // si es la úlñtima página, se termina el test
                        if (isLastPage) {
                            // se continua la prueba
                            callback(null, 'hola carola')
                        } else {
                            // no es la última página, entonces se intenta obtener la siguiente página
                            paginationData.page++
                                getPaginatedUsers(callback)
                        }
                    });
            },

            // Nicole o David inician algunos chats (si el usuario es hombre lo inicia Nicole, si es mujer entonces David)
            function createChats(res, callback) {
                // se crea una conversación con cada uno de los usuarios muestra que se tienen, se empieza por el primero
                var indexUserToChat = 0
                // usuario con el que se iniciará el chat
                var userToChat = _.isUndefined(usersToChat[indexUserToChat]) ? null : usersToChat[indexUserToChat]

                // se valida que el usuario no sea nulo
                if (!_.isNull(userToChat)) {
                    // si el usuario es hombre entonces le habla Nicole, David le habla a las mujeres
                    senderId = _.isEqual(userToChat.sexo, 'M') ? NICOLE : DAVID
                    // id del usuario con el que se inicia el chat
                    receiverId = userToChat.id

                    // se realiza la petición a la API
                    request
                        .post('/create_chat/' + senderId + '/' + receiverId)
                        .set('Accept', 'application/json')
                        .send({})
                        .expect(200)
                        .expect('Content-type', "text/html; charset=UTF-8")
                        .end(function (err, res) {
                            // se valida si hay un error
                            if (err) {
                                throw new Error(err);
                            }

                            // respuesta del servicio
                            var response = res.body

                            console.log('senderId: %s, receiverId: %s, receiverSex: %s', senderId, receiverId, userToChat.sexo);
                            console.log('response:');
                            console.log(response);

                            done()
                        })
                    
                }


                
            }
        ], function () {
            console.log('DONE!');
        })


    })

    describe('Nicole', function() {

        it('Debería obtener el listado de chats de Nicole', function(done) {
            // datos que se envían en el request
            var data = {}

            // solicitud http
            request
                .get('/chat_list/1')
                .set('Accept', 'application/json')
                .send(data)
                .expect(200)
                .expect('Content-type', "text/html; charset=UTF-8")
                .end(function(err, res) {
                    // console.log('res: ', res.body);

                    done();
                });
        })
    })

})
