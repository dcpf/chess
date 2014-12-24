var SocketIO = function (attrs) {

    var eventHandler = attrs.eventHandler,
        gameID = attrs.gameID,
        playerEmail = attrs.playerEmail,
        opponentEmail = attrs.opponentEmail,
        socket = window.io ? io.connect(attrs.url) : null,
        listener = {};

    // Event name constants
    var events = {
        CONNECT: 'connect',
        JOIN: 'join',
        ONLINE: 'online',
        OFFLINE: 'offline',
        MOVE_SAVED: 'moveSaved',
        DISCONNECT: 'disconnect'
    };

    // mixin the backbone event module so we can listen for events
    _.extend(listener, Backbone.Events);
    
    listener.listenTo(eventHandler, eventHandler.messageNames.MOVE_SAVED, moveSaved);
    
    function moveSaved (res) {
        if (socket) {
            // Send a message to the server that a move has been made
            socket.emit(events.MOVE_SAVED, res);
        }
    }
    
    if (socket) {
        
        // On initial connection, send the player and opponent email to the server. The server
        // will register that we're online (and broadcast it to all other clients), and will
        // also let us know when our opponent goes on- or off-line.
        socket.on(events.CONNECT, function() {
            socket.emit(events.JOIN, {playerEmail: playerEmail, opponentEmail: opponentEmail});
        });

        // Opponent is online
        socket.on(events.ONLINE, function(email) {
            if (email === opponentEmail) {
                eventHandler.trigger(eventHandler.messageNames.PLAYER_ONLINE, email);
            }
        });

        // Listen for 'moveSaved' messages from server. If the gameID matches this one, trigger the appropriate client events.
        socket.on(events.MOVE_SAVED, function(data) {
            if (data.gameID.split('-')[0] === gameID.split('-')[0]) {
                eventHandler.trigger(eventHandler.messageNames.OPPONENT_HAS_MOVED, data);
            }
        });
        
        // Opponent has gone offline
        socket.on(events.OFFLINE, function(email) {
            if (email === opponentEmail) {
                eventHandler.trigger(eventHandler.messageNames.PLAYER_OFFLINE, email);
            }
        });

    }

};
