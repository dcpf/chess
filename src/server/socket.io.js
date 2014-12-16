'use strict';

module.exports = init;

/*
  Opens the socket connection and sets up the event listsners
*/
function init (server) {
    
    var io = require('socket.io')(server);
    
    io.on('connect', function (client) {
        
        // When we receive a 'moveSaved' message, broadcast it back to all clients (except the one that originated the event).
        // If the opponent's client is connected, it will receive the notification that a move has been made.
        client.on('moveSaved', function(data) {
            client.broadcast.emit('moveSaved', data);
        });
        
    });
    
}
