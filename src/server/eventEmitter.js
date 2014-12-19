'use strict';

var events = require('events');

var eventEmitter;
if (!eventEmitter) {
    eventEmitter = new events.EventEmitter();
}

eventEmitter.messages = {
    SEND_GAME_CREATION_NOTIFICATION: 'sendGameCreationNotification',
    SEND_INVITE_NOTIFICATION: 'sendInviteNotification',
	SEND_MOVE_NOTIFICATION: 'sendMoveNotification',
    SEND_FORGOT_GAME_ID_NOTIFICATION: 'sendForgotGameIdNotification',
    SEND_FEEDBACK_NOTIFICATION: 'sendFeedbackNotification'
};

module.exports = eventEmitter;
