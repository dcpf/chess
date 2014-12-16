var SocketIO = function (attrs) {

    var eventHandler = attrs.eventHandler,
        socket = window.io ? io.connect(attrs.url) : null,
        gameID = null,
        eventsObj = {};
    
    this.setGameID = function (id) {
        gameID = id;
    };
    
    // mixin the backbone event module so we can listen for events
    _.extend(eventsObj, Backbone.Events);
    
    eventsObj.listenTo(eventHandler, eventHandler.messageNames.MOVE_SAVED, moveSaved);
    
    function moveSaved (res) {
        if (socket) {
            // Send a message to the server that a move has been made
            socket.emit('moveSaved', res);
        }
    }
    
    if (socket) {
        
        // Listen for 'moveSaved' messages from server. If the gameID matches this one, trigger the appropriate client events.
        socket.on('moveSaved', function(data){
            if (data.gameID.split('-')[0] === gameID.split('-')[0]) {
                eventHandler.trigger(eventHandler.messageNames.OPPONENT_HAS_MOVED, data);
                eventHandler.trigger(eventHandler.messageNames.ENTER_GAME, gameID, false);
            }
        });
        
    }
    
};
