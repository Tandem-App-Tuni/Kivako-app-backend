const fs = require('fs');

var start = function(server, session)
{
    var shrdSession = require("express-socket.io-session");
    var io = require('socket.io').listen(server);
    io.use(shrdSession(session));

    io.on('connection', (socket) => 
    {
        console.log('User connected to chat service...');
        var isAuthenticated = true;

        console.log(socket.handshake.session.passport);

        if (isAuthenticated)
        {
            socket.emit('message', 'Hello from the server!');
        }
        else
        {
            console.log('Disconnecting unauthorised client connection!');
            socket.disconnect();
        }

        socket.on('disconnect', function () 
        {
            console.log('Socket disconnected!');
        });
    });

    console.log('ChatServer online!');
};


module.exports =
{
    start:start
};

