var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;


io.on('connection', function(socket){
    console.log('A user connected');

    socket.on('lool',(data)=>{
        console.log(data);
    })
});

socketApi.sendNotification = function() {
  
    io.sockets.on('hello', {msg: 'Hello World!'});
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
}

module.exports = socketApi;