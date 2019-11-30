const fs = require('fs');

// ##############################################################################
// TEMPORARY TEST USER DATA

var userData0 = 
{
    userId: 'user1@example.com',
    userName: 'Brian Adams',
    rooms: [{roomId: 'user1@example.com|user2@example.com'}, 
            {roomId: 'user1@example.com|user3@example.com'}],
};

var roomData = 
[
    {roomId: 'user1@example.com|user2@example.com', 
     messages: [{id:'user1@example.com', timestamp: new Date(), text: 'Hello, how are you?'},
                {id:'user2@example.com', timestamp: new Date(), text: 'Hey, I am fine, how about you?'},
                {id:'user1@example.com', timestamp: new Date(), text: 'Fine aswell. When shall we meet up?'}]}, 
    {roomId: 'user1@example.com|user3@example.com',
     messages: [{id:'user3@example.com', timestamp: new Date(), text: 'Hey, could you teach me some Finnish?'}]}
];

var data0 = 
{
    rooms: [{roomId: 'user1@example.com|user2@example.com', name: 'Brian Adams'}, {roomId: 'user1@example.com|user3@example.com', name: 'Veronica Mars'}], 
    messages: 
    [
        [{id:'user1@example.com', timestamp: new Date(), text: 'Hello, how are you?'},
         {id:'user2@example.com', timestamp: new Date(), text: 'Hey, I am fine, how about you?'},
         {id:'user1@example.com', timestamp: new Date(), text: 'Fine aswell. When shall we meet up?'}],
        [{id:'user3@example.com', timestamp: new Date(), text: 'Hey, could you teach me some Finnish?'}]
    ]
};

// ##############################################################################


// Total number of users currently online and chating.
var totalUserOnline = 0;

/*A dictionary storing the currently active users.
* Eachs active user stores a structure contiaining room names
* for that specific user. Similar for active rooms which hold the messages
* of that specific room.
*/
var activeUsers = {};
var activeRooms = {};

var incrementTotalUserCount = function()
{
    totalUserOnline++;
}

var decreaseTotalUserCount = function()
{
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
var start = function(server, session)
{
    var shrdSession = require("express-socket.io-session");
    var io = require('socket.io').listen(server);
    io.use(shrdSession(session));

    io.on('connection', (socket) => 
    {
        var passportSession = socket.handshake.session.passport;

        console.log('Trying to create connection...');

        /**
         * An authenticated user joins the room for the first time.
         * Appropriate objects are created, such as active users and active rooms.
         * If the user is not authenticated the socket is disconnected.
         */
        if ((typeof passportSession) != 'undefined')
        {
            var userId = passportSession.user.email;
            var userRooms = data0.rooms;
            var messages = data0.messages;

            userRooms.forEach((element, index) => 
            {
                if (element.roomId in activeRooms) messages[index] = activeRooms[element.roomId].messages;
                else activeRooms[element.roomId] = {userCount: 0, messages: messages[index]};
            });

            activeUsers[userId] = {user: userId, rooms: userRooms};
            socket.emit('initialization', {user: userId, rooms: userRooms, messages: messages});
            incrementTotalUserCount();

            console.log('User email: ' + passportSession.user.email);
            console.log('User connected sucessfully!');
        }
        else
        {
            console.log('Disconnecting unauthorised client connection!');
            socket.disconnect();
        }

        /**
         * Function listens to socket disconnection events
         * and removes the user from the active user table.
         * If the rooms that the user participated in have 0 active users
         * store the rooms in the database.
         * */
        socket.on('disconnect', function () 
        {
            var userId = passportSession.user.email;

            console.log('Disconnecting user', userId);

            if (!(userId in activeUsers))
            {
                console.log('Disconnecting an inactive user?');
                console.log('ActiveUser count', totalUserOnline, 'activeUser key count:',Object.keys(activeUsers).length);

                return;
            }

            var userRooms = activeUsers[userId].rooms;

            userRooms.forEach((element) => 
            {
                var roomId = element.roomId;

                activeRooms[roomId].userCount--;
                if (activeRooms[roomId].userCount == 0) delete activeRooms[roomId]; // Store room data back to the database TODO
            });

            delete activeUsers[userId];

            decreaseTotalUserCount();
        });

        /**
         * Function listens for client room subscription events.
         * The data sent from the client contains information 
         * about the room the client is leaving and the room they are
         * trying to enter. TODO add check if room is valid for user.
         * Also sends the room messages object to the client in case unbuffered
         * messages were sent when he/she was not subscribed to the room.
         */
        socket.on('subscribe', function (data) 
        {
            console.log('Channel subscription request: ' + data.from, data.to + ' -> ' + passportSession.user.email);

            if (data.from != 'null') socket.leave(data.from);
            if (data.to != 'null') 
            {
                socket.join(data.to);
                socket.emit('roomUpdate', {roomId: data.to, room: activeRooms[data.to]});
            }
        });

        /**
         * Function listens for all messages emited by clients.
         * The message is stored in the room object and emited
         * to all clients listening on the room.
         */
        socket.on('message', function(data) 
        {
            var user = data.user;
            var message = data.message;
            var roomId = data.roomId;

            console.log('Message recieved from user ', user, ' from room ', roomId, '->', message);
            
            socket.to(roomId).emit('message', message);
            activeRooms[roomId].messages.push(message);
        });
    });

    console.log('ChatServer online!');
};


module.exports =
{
    start:start
};

