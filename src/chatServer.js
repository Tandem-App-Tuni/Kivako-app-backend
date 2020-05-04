const fs = require('fs');

const User = require('./models/user');
const Room = require('./models/room.js');

const Logger = require('./logger');
const Email = require('./emailServer.js');
const schedule = require('node-schedule');

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

        Logger.write('chat', `Trying to create connection ${passportSession}`);

        if (passportSession)
        {
            Logger.write('chat', `Session authenticated!`);
            loggedInUsers.set(passportSession.user.email, socket);
        }
        else
        {
            Logger.write('chat', `Disconnecting unauthorised client connection!`);
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
                        Logger.write('chat', `Did not find user with email ${userId}`, 2);
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
                            Logger.write('chat', `Maybe did not find second user with email ${user1.email}`, 2);
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

                    Logger.write('chat', `User email ${userId}`);
                    Logger.write('chat', `User connected to the chat successfully!`);
                } 
            }
            catch(error)
            {
                Logger.write('chat', `Error in chatInitialization ${error}`, 2);
            }
        });

        socket.on('adminGlobal', function(e) 
        {
            try
            {
                Logger.write('chat', `Global message ${e.message}`);
                io.sockets.emit('broadcast', {message: e.message});
            }
            catch (error)
            {
                Logger.write('chat', `Error in adminGlobal ${error}`, 2);
            }
        });

        socket.on('disconnect', function () 
        {
            try
            {
                if (passportSession)
                {
                    let userId = passportSession.user.email;
                    Logger.write('chat', `User with id ${userId} disconnected.`);

                    if (activeUsers.has(userId)) activeUsers.delete(userId);
                    loggedInUsers.delete(userId);
                }
                else Logger.write('chat', `User disconnected ${socket.handshake.session.passport}.`);
            }
            catch (error)
            {
                Logger.write('chat', `Error disconnecting from the chat server ${error}`);
            }
        });

        socket.on('subscribe', async function (data) 
        {
            try
            {
                const userId = passportSession.user.email;
                Logger.write('chat', `Channel subscription request: ${data.from} ${data.to} -> ${passportSession.user.email}`);

                if (data.from != 'null') socket.leave(data.from);
                if (data.to != 'null') 
                {
                    socket.join(data.to);

                    let room = await Room.findById(data.to);

                    if (!room) 
                    {
                        Logger.write('chat', `Room with ID ${data.to} not found.`, 2);
                        return;
                    }

                    if ((userId !== room.user0) && (userId !== room.user1))
                    {
                        Logger.write('chat', `User ${passportSession.user.email} requested invalid room!`, 2);
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
                Logger.write('chat', `Error in subscribe ${error}.`, 2);
            }
        });

        socket.on('chatLeave', async function(data) 
        {
            try
            {
                Logger.write('chat', `User ${passportSession.user.email} leaving the chat.`);
                activeUsers.delete(passportSession.user.email);
            }
            catch(error)
            {
                Logger.write('chat', `Error in chatLeave ${error}.`);
            }
        });        

        socket.on('checkNotifications', async function() 
        {
            try
            {
                let user = await User.findOne({email:passportSession.user.email}, 'chatNotification');

                Logger.write('chat', `User to send notification: ${user}`);

                if (user.chatNotification) socket.emit('notification', {});
            }
            catch (error)
            {
                Logger.write('chat', `Error in checkNotifications ${error}`);
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

                Logger.write('chat', `Message recieved from user ${user} from room ${roomId}.`);

                socket.to(roomId).emit('message', message);

                let room = await Room.findByIdAndUpdate(roomId, {$push: {messages: message}});
                let user1 = room.user0 !== userId ? room.user0 : room.user1;

                if (!activeUsers.has(user1)) 
                {
                    await User.findOneAndUpdate({email:user1}, {chatNotification: true});

                    Logger.write('chat', `[CHAT] User logged in ${loggedInUsers.has(user1)}`);

                    if (loggedInUsers.has(user1)) 
                    {
                        loggedInUsers.get(user1).emit('notification', {});
                    }
                    else
                    {
                        let user1Data = await User.findOne({email: user1});

                        Email.sendNewMessageNotificationEmail(await User.findOne({email: user}), user1Data, message.text);
                    }
                }
            }
            catch (error)
            {
                Logger.write('chat', `[CHAT ERROR] Error in message ${error}`, 2);
            }
        });
    });

    schedule.scheduleJob('10 * * * *', () => checkLoginActive());

    Logger.write('chat', `[CHAT] ChatServer online!`);
};

function checkLoginActive()
{
    try
    {
        Logger.write('chat', `Checking map contents a:${activeUsers.size} l:${loggedInUsers.size}`);

        let logToRemove = [];
        let activeToRemove = [];

        for (let email of loggedInUsers.keys())
        {
            const socket = loggedInUsers.get(email);
            if (!socket.connected)
            {
                Logger.write('chat', `User ${email} recorded in login but not connected...removing.`);

                logToRemove.push(email);
            }
        }

        for (let email of activeUsers.keys())
        {
            const socket = activeUsers.get(email);
            if (!socket.connected)
            {
                Logger.write('chat', `User ${email} recorded in active but not connected...removing.`);

                activeToRemove.push(email);
            }
        }

        Logger.write('chat', `Removing ${logToRemove.length} logged in users and ${activeToRemove.length} active users.`);
        for (email in logToRemove) loggedInUsers.delete(email);
        for (email in activeToRemove) activeToRemove.delete(email);
    }
    catch(error)
    {
        Logger.write('chat', `Error inside checkLoginActive: ${error}`, 2);
    }
}


module.exports = {
    start: start
};