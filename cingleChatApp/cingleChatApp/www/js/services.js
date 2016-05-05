// Users
angular.module('starter.services', [])
    .factory('User', function () {
        var users = [
            {
                id: "1",
                friendType: "Messenger",
                name: "felix",
                face: 'img/user01.jpg',
                email: 'hi@weburner.com',
                activeTime: "Active today"
            },
            {
                id: "2",
                friendType: "facebook",
                name: "Eric",
                face: 'img/user02.jpg',
                email: 'hi@weburner.com',
                activeTime: "Active 1h ago"
            },
            {
                id: "3",
                name: "Apple",
                friendType: "Messenger",
                face: 'img/user03.jpg',
                email: 'hi@weburner.com',
                activeTime: "Active today"
            },
            {
                id: "213",
                name: "Diamond",
                friendType: "Messenger",
                face: 'img/user04.jpg',
                email: 'hi@weburner.com',
                activeTime: "Active 3m ago"
            },
            {
                id: "5",
                name: "Mike",
                friendType: "facebook",
                face: 'img/user05.jpg',
                email: 'hi@weburner.com',
                activeTime: "Active today"
            }
        ];

        return {
            all: function () {
                return users;
            },
            myFriends: function (myId) {
                var friends = [];
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id != myId) {
                        friends.push( users[i]);
                    }
                }
                return friends;
            },
            get: function (userId) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id === userId) {
                        return users[i];
                    }
                }
                return null;
            }
        };
    })

// Rooms
    .factory('Room', ['User', 'Chat', function (User, Chat) {
        var rooms = [
            {
                id: "room_a",
                roomType: "group",
                thumbnail: "img/thumbnail01.jpg",
                title: "I Love Coffee",
                members: "Felix, Eric, Diamond",
                activeTime: "Active today",
                userList: ["213", "1", "2"]
            },
            {
                id: "room_b",
                roomType: "group",
                thumbnail: "img/thumbnail02.jpg",
                title: "Go shopping",
                members: "Eric, Apple, Diamond",
                activeTime: "Active today",
                userList: ["2", "3", "213"]
            },
            {
                id: "room_c",
                roomType: "ms_friend",
                thumbnail: "img/user01.jpg",
                title: "felix",
                members: "Felix, Diamond",
                activeTime: "Active 1h ago",
                userList: ["213", "1"]
            },
            {
                id: "room_d",
                roomType: "ms_friend",
                thumbnail: "img/user02.jpg",
                title: "Eric",
                members: "Eric, Diamond",
                activeTime: "Active 1h ago",
                userList: ["213", "2"]
            },
            {
                id: "room_e",
                roomType: "group",
                thumbnail: "img/thumbnail03.jpg",
                title: "Ionic",
                members: "Eric, Apple, Mike, Diamond",
                activeTime: "11:00 am",
                userList: ["2", "3", "5", "213"]
            },
            {
                id: "room_f",
                roomType: "group",
                thumbnail: "img/thumbnail04.jpg",
                title: "Rockers",
                members: "felix, Eric, Diamond, Mike",
                activeTime: "12:15 am",
                userList: ["1", "2", "213", "5"]
            }
        ];
        return {
            all: function () {
                return rooms;
            },

            // for tab-groups
            allGroups: function (userId, rowItemNum) {
                var groupList = [];
                var rowList = [];
                for (var i = 0; i < rooms.length; i++) {
                    var isInRoom = false;
                    if (!isInRoom && rooms[i].userList.length > 2) {
                        for (var j = 0; j < rooms[i].userList.length; j++) {
                            if (rooms[i].userList[j] === userId) {
                                isInRoom = true;
                            }
                        }
                    }
                    if (isInRoom) {
                        rowList.push(rooms[i]);
                    }
                    if (rowList.length == rowItemNum || i + 1 == rooms.length) {
                        groupList.push(rowList);
                        rowList = [];
                    }
                }
                return groupList;
            },

            // for tab-activities
            userActivities: function (userId) {
                var roomList = [];
                for (var i = 0; i < rooms.length; i++) {
                    var isInRoom = false;
                    if (!isInRoom) {
                        for (var j = 0; j < rooms[i].userList.length; j++) {
                            if (rooms[i].userList[j] === userId) {
                                isInRoom = true;
                            }
                        }
                    }
                    if (isInRoom) {
                        var roomChats = Chat.getByRoom(rooms[i].id);

                        if(roomChats.length > 0){
                            rooms[i].latest_chat = roomChats[roomChats.length - 1].chatText;
                            roomList.push(rooms[i]);
                        }
                    }
                }
                return roomList;
            },

            get: function (roomId) {
                for (var i = 0; i < rooms.length; i++) {
                    if (rooms[i].id === roomId) {
                        rooms[i].user = [];
                        for (var j = 0; j < rooms[i].userList.length; j++) {
                            rooms[i].user.push(User.get(rooms[i].userList[j]));
                        }
                        return rooms[i];
                    }
                }
                return null;
            },
            newRoom: function(userId){
                var user = User.get(userId);
                var newRoom = {
                    id: "",
                    roomType: "fb_friend",
                    thumbnail: user.face,
                    title: user.name,
                    members: user.name + ", Diamond",
                    activeTime: "Now",
                    userList: ["213", user.id]
                };
                return newRoom;
            },
            newGroup: function(groupName, UserList){
                var userList = UserList.split("+");
                var newRoom = {
                    id: "",
                    roomType: "group",
                    thumbnail: "img/placeholder.png",
                    title: groupName,
                    members: "",
                    activeTime: "Now",
                    userList: userList
                };
                newRoom.user = [];
                for (var j = 0; j < userList.length; j++) {
                    newRoom.user.push(User.get(userList[j]));
                }
                return newRoom;
            },

            // for tab-friends
            getByUserId: function (userId) {
                var hasRoom = false;
                for (var i = 0; i < rooms.length; i++) {
                    if(rooms[i].roomType != "group" && !hasRoom){
                        for(var j=0; j<rooms[i].userList.length; j++){
                            if(rooms[i].userList[j] === userId){
                                hasRoom = true;
                                return rooms[i];
                            }
                        }
                    }
                }
                if(!hasRoom){
                    var user = User.get(userId);
                    var newRoom = {
                        id: "new" + "/" + user.id
                    };
                    return newRoom;
                }
                return null;

            }
        };
    }])

// Chats
    .factory('Chat', ['User', function (User) {
        var chats = [
            {
                id: "0",
                userId: "1",
                chatText: 'I found a great coffee shop.',
                roomId: "room_a"
            },
            {
                id: "1",
                userId: "2",
                chatText: 'Where is it?',
                roomId: "room_a"
            },
            {
                id: "2",
                userId: "1",
                chatText: 'Not far from the office building.',
                roomId: "room_a"
            },
            {
                id: "3",
                userId: "213",
                chatText: 'Shall we go there today?',
                roomId: "room_a"
            },
            {
                id: "4",
                userId: "3",
                chatText: 'What\'up!',
                roomId: "room_b"
            },
            {
                id: "5",
                userId: "5",
                chatText: 'I\'m going to do some shopping.',
                roomId: "room_b"
            },
            {
                id: "6",
                userId: "3",
                chatText: 'Let\' s go together.',
                roomId: "room_b"
            },
            {
                id: "7",
                userId: "213",
                chatText: 'I\'ll go with you boys.',
                roomId: "room_b"
            },
            {
                id: "8",
                userId: "213",
                chatText: 'Hey.',
                roomId: "room_c"
            },
            {
                id: "9",
                userId: "1",
                chatText: 'Hey.',
                roomId: "room_c"
            },
            {
                id: "10",
                userId: "1",
                chatText: 'Hey hey.',
                roomId: "room_c"
            },
            {
                id: "11",
                userId: "213",
                chatText: 'Ionic.',
                roomId: "room_d"
            },
            {
                id: "12",
                userId: "2",
                chatText: 'Angular.',
                roomId: "room_d"
            },
            {
                id: "13",
                userId: "2",
                chatText: 'Welcome!.',
                roomId: "room_e"
            },
            {
                id: "14",
                userId: "3",
                chatText: 'Ionic is a powerful HTML5 SDK that helps you build native-feeling mobile apps using web technologies like HTML, CSS, and Javascript.',
                roomId: "room_e"
            },
            {
                id: "15",
                userId: "213",
                chatText: 'Ionic is focused mainly on the look and feel, and UI interaction of your app.',
                roomId: "room_e"
            },
            {
                id: "16",
                userId: "5",
                chatText: 'Ionic currently requires AngularJS.',
                roomId: "room_e"
            }
        ];

        return {
            all: function () {
                return chats;
            },
            add: function (chatText, roomId, userId) {
                var chat = {
                    id: chats.length + 1,
                    userId: userId,
                    chatText: chatText,
                    roomId: roomId
                };
                chats.push(chat);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === chatId) {
                        chats[i].user = User.get(chats[i].userId);
                        return chats[i];
                    }
                }
                return null;
            },
            getByRoom: function (roomId) {
                var chatList = [];
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].roomId === roomId) {
                        chats[i].user = User.get(chats[i].userId);
                        chatList.push(chats[i]);
                    }
                }
                return chatList;
            }
        };
    }]);