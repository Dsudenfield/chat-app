var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];

server.listen(process.env.PORT || 3000);
console.log('server running');
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    console.log('connected: sockets connected ' + io.engine.clientsCount);
    socket.on('disconnect', function(data) {
        console.log('disconnected: sockets connected: ' + io.engine.clientsCount);
        // disconnect
        if(!socket.username) {
            return
        }
        users.splice(users.indexOf(socket.username), 1);
        updateUserNames();
        
    });

    socket.on('send-message', function(data) {
        io.sockets.emit('new-message', {
            msg: data,
            user: socket.username
        });
    });

    socket.on('new-user', function(data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUserNames();
    });

    socket.on('typing', function(data) {
        socket.broadcast.emit('typing-message', data);
    });

    function updateUserNames() {
        io.sockets.emit('get-users', users);
    }

});