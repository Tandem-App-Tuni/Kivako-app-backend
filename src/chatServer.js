const fs = require('fs');

const User = require('./models/user');
const Room = require('./models/room.js');

// Total number of users currently online and chating.
var totalUserOnline = 0;

var incrementTotalUserCount = function () {
    totalUserOnline++;
}

var decreaseTotalUserCount = function () {
    totalUserOnline--;

    if (totalUserOnline < 0) console.log('Total user count is below 0...report this to the maintainer!');
}

/**
 * ChatServer creates a socket.io session, managing user ids
 * and total user count. Each user has different rooms they are subscribed to
 * deppending on the conversations taking place. First the socket connects to the
 * server. User authentication is checked in the database. Then the user active room data
 * is loaded from the database. The room name and messages are loaded and sent to the user.
 * When a user dissconnects he sends the newly typed and recieved messages to the server. 
 * 
 * @param {*} server The express server, cupling the http server with socket.io
 * @param {*} session The session of the server, shared with socket.io
 */
var start = function (server, session) {
    var shrdSession = require("express-socket.io-session");
    var io = require('socket.io').listen(server);
    io.use(shrdSession(session));

    io.on('connection', (socket) => {
        var passportSession = socket.handshake.session.passport;

        console.log('Trying to create connection...');

        /**
         * An authenticated user joins the room for the first time.
         * Appropriate objects are created and sent to the client
         * for displaying.
         */
        if ((typeof passportSession) != 'undefined') {
            let userId = passportSession.user.email;

            User.findOne({
                email: userId
            }).then((userData) => {
                if (!userData) {
                    console.log('Did not find user with email:', userId, 'Report this to the mantainer!');
                    socket.disconnect();
                    return;
                }

                userData.rooms.forEach((roomId, index) => {
                    let secondUserId;
                    roomId.split('|').forEach((element) => {
                        if (element != userId) secondUserId = element;
                    });

                    Room.findOne({
                        roomId: roomId
                    }).then((roomData) => {
                        if (!roomData) {
                            console.log('Did not find room with id:', element, 'Report this to the mantainer!');
                            socket.disconnect();
                            return;
                        }

                        User.findOne({
                            email: secondUserId
                        }).then((secondUserData) => {
                            if (!secondUserData) {
                                console.log('Did not find second user with email:', secondUserData.email, 'Report this to the mantainer!');
                                return;
                            }

                            socket.emit('initialization', {
                                user: userId,
                                roomInformation: {
                                    roomId: roomId,
                                    messages: roomData.messages
                                },
                                name: secondUserData.firstName + ' ' + secondUserData.lastName,
                                email: secondUserId
                            });
                        });
                    });
                });


                incrementTotalUserCount();
                console.log('User email: ' + userId);
                console.log('User connected sucessfully!');
            });
        } else {
            console.log('Disconnecting unauthorised client connection!');
            socket.disconnect();
        }

        /**
         * Functino listens to socket disconnection events.
         * */
        socket.on('disconnect', function () {
            let userId = passportSession.user.email;

            decreaseTotalUserCount();
            console.log('User information removed...disconnecting user ' + userId);
        });

        /**
         * Function listens for client room subscription events.
         * The data sent from the client contains information 
         * about the room the client is leaving and the room they are
         * trying to enter. TODO add check if room is valid for user.
         * Also sends the room messages object to the client in case unbuffered
         * messages were sent when he/she was not subscribed to the room.
         */
        socket.on('subscribe', function (data) {
            console.log('Channel subscription request: ' + data.from, data.to + ' -> ' + passportSession.user.email);

            if (data.from != 'null') socket.leave(data.from);
            if (data.to != 'null') {
                socket.join(data.to);

                Room.findOne({
                    roomId: data.to
                }).then((roomData) => {
                    if (!roomData) {
                        console.log('Room with ID', data.to, 'not found!');
                        return;
                    }

                    socket.emit('roomUpdate', {
                        roomId: data.to,
                        room: roomData
                    });
                });
            }
        });

        /**
         * Function listens for all messages emited by clients.
         * The message is stored in the room object and emited
         * to all clients listening on the room.
         */
        socket.on('message', function (data) {
            var user = data.user;
            var message = data.message;
            var roomId = data.roomId;

            console.log('Message recieved from user', user, 'from room', roomId, '->', message);

            socket.to(roomId).emit('message', message);
            Room.findOneAndUpdate({
                roomId: roomId
            }, {
                $push: {
                    messages: message
                }
            }).exec();
        });
    });

    console.log('ChatServer online!');
};


module.exports = {
    start: start
};