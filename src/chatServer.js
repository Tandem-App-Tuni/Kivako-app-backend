const fs = require('fs');

const User = require('./models/user');
const Room = require('./models/room.js');

const activeUsers = new Map();
const loggedInUsers = new Map();

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
var start = function (server, session) 
{
    var shrdSession = require("express-socket.io-session");
    var io = require('socket.io').listen(server);
    io.use(shrdSession(session));

    io.on('connection', async (socket) =>
    {
        var passportSession = socket.handshake.session.passport;

        console.log('[CHAT] Trying to create connection...', passportSession);
        
        if (passportSession)
        {
            console.log('[CHAT] Session authenticated!');
            loggedInUsers.set(passportSession.user.email, socket);
        }
        else
        {
            console.log('[CHAT] Disconnecting unauthorised client connection!');
            socket.disconnect();
        }

        socket.on('chatInitialization', async function ()
        {
            try
            {
                if ((typeof passportSession) != 'undefined') 
                {
                    let userId = passportSession.user.email;
                    let user0 = await User.findOne({email: userId});
                    
                    if (!user0) 
                    {
                        console.log('[CHAT] Did not find user with email:', userId);
                        socket.disconnect();
                        return;
                    }

                    activeUsers.set(userId, 1);


                    user0.rooms.forEach(async (roomId, index) => 
                    {
                        let room = await Room.findById(roomId);
                        let user1 = await User.findOne({email: userId !== room.user1 ? room.user1 : room.user0});
                        
                        if (!user1) 
                        {
                            console.log('[CHAT] Maybe did not find second user with email:', user1.email);
                            socket.disconnect();
                            return;
                        }

                        socket.emit('chatData', 
                        {
                            user: userId,
                            roomInformation: 
                            {
                                roomId: roomId,
                                messages: room.messages
                            },
                            name: user1.firstName + ' ' + user1.lastName,
                            email: user1.email
                        });
                    });

                    await User.findByIdAndUpdate(user0._id, {chatNotification: false}).exec();

                    console.log('[CHAT] User email: ' + userId);
                    console.log('[CHAT] User connected to the chat successfully!');
                } 
            }
            catch(error)
            {
                console.log('[CHAT ERROR] Error in chatInitialization', error);
            }
        });

        socket.on('adminGlobal', function(e) 
        {
            try
            {
                console.log('[CHAT] Global message', e.message);
                io.sockets.emit('broadcast', {message: e.message});
            }
            catch (error)
            {
                console.log('[CHAT] Error in adminGlobal', error);
            }
        });

        socket.on('disconnect', function () 
        {
            try
            {
                if (passportSession)
                {
                    let userId = passportSession.user.email;
                    console.log('[CHAT] User with id', userId, 'disconnected.');

                    if (activeUsers.has(userId)) activeUsers.delete(userId);
                    loggedInUsers.delete(userId);
                }
                else console.log('[CHAT] User disconnected.', socket.handshake.session.passport);
            }
            catch (error)
            {
                console.log('[CHAT] Error disconnecting from the chat server', error);
            }
        });

        socket.on('subscribe', async function (data) 
        {
            try
            {
                const userId = passportSession.user.email;
                console.log('[CHAT] Channel subscription request: ' + data.from, data.to + ' -> ' + passportSession.user.email);

                if (data.from != 'null') socket.leave(data.from);
                if (data.to != 'null') 
                {
                    socket.join(data.to);

                    let room = await Room.findById(data.to);

                    if (!room) 
                    {
                        console.log('[CHAT] Room with ID', data.to, 'not found!');
                        return;
                    }

                    if ((userId !== room.user0) && (userId !== room.user1))
                    {
                        console.log('[CHAT] User ' + passportSession.user.email + ' requested invalid room!');
                        socket.disconnect();
                        return;
                    }

                    socket.emit('roomUpdate', 
                    {
                        roomId: data.to,
                        room: room
                    });
                }
            }
            catch (error)
            {
                console.log('[CHAT ERROR] Error in subscribe', error);
            }
        });

        socket.on('chatLeave', async function(data) 
        {
            try
            {
                console.log('[CHAT] User', passportSession.user.email, 'leaving the chat!');
                activeUsers.delete(passportSession.user.email);
            }
            catch(error)
            {
                console.log('[CHAT ERROR] Error in chatLeave', error);
            }
        });        

        socket.on('checkNotifications', async function() 
        {
            try
            {
                let user = await User.findOne({email:passportSession.user.email}, 'chatNotification');

                console.log('[CHAT] User to send notification:', user);

                if (user.chatNotification) socket.emit('notification', {});
            }
            catch (error)
            {
                console.log('[CHAT] Error in checkNotifications', error);
            }
        });

        socket.on('message', async function (data) 
        {
            try
            {
                let userId = passportSession.user.email;
                let user = data.user;
                let message = data.message;
                let roomId = data.roomId;

                console.log('[CHAT] Message recieved from user', user, 'from room', roomId, '->', message);

                socket.to(roomId).emit('message', message);

                let room = await Room.findOneAndUpdate(roomId, {$push: {messages: message}});
                let user1 = room.user0 !== userId ? room.user0 : room.user1;

                if (!activeUsers.has(user1)) 
                {
                    await User.findOneAndUpdate({email:user1}, {chatNotification: true});

                    console.log('[CHAT] User logged in', loggedInUsers.has(user1));

                    if (loggedInUsers.has(user1)) 
                    {
                        console.log('[CHAT] Sending notificaiton!');
                        loggedInUsers.get(user1).emit('notification', {});
                    }
                }
            }
            catch (error)
            {
                console.log('[CHAT ERROR] Error in message', error);
            }
        });
    });

    console.log('[CHAT] ChatServer online!');
};


module.exports = {
    start: start
};