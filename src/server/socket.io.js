'use strict';

module.exports = init;

var events = {
    CONNECT: 'connect',
    JOIN: 'join',
    ONLINE: 'online',
    OFFLINE: 'offline',
    MOVE_SAVED: 'moveSaved',
    DISCONNECT: 'disconnect'
};

/*
  Opens the socket connection and sets up the event listsners
*/
function init (server) {
    
    var playerMap = {},
        io = require('socket.io')(server);
    
    io.on(events.CONNECT, function (client) {
        
        // When a player joins, broadcast the player's email to all clients. Also send a message
        // back to the calling client indicating whether their opponent is online or offline.
        client.on(events.JOIN, function(data) {
            
            var playerEmail = data.playerEmail;
            var opponentEmail = data.opponentEmail;
            
            // Add the player's email to the playerMap
            playerMap[client.id] = playerEmail;
            
            // Broadcast the message to all clients
            client.broadcast.emit(events.ONLINE, playerEmail);
            
            // If the player's opponent is online, send a message back to the client.
            var opponentOnline = false;
            for (var id in playerMap) {
                var email = playerMap[id];
                if (email && email === opponentEmail) {
                    opponentOnline = true;
                    break;
                }
            }
            var evt = (opponentOnline) ? events.ONLINE : events.OFFLINE;
            client.emit(evt, opponentEmail);
            
        });
        
        // When we receive a 'moveSaved' message, broadcast it back to all clients (except the one that originated the event).
        // If the opponent's client is connected, it will receive the notification that a move has been made.
        client.on(events.MOVE_SAVED, function(data) {
            client.broadcast.emit(events.MOVE_SAVED, data);
        });
        
        // Broadcast when a client disconnects
        client.on(events.DISCONNECT, function () {
            client.broadcast.emit(events.OFFLINE, playerMap[client.id]);
            delete(playerMap[client.id]);
        });
        
    });
    
}
