const events = require('events');

const eventEmitter = new events.EventEmitter();
eventEmitter.messages = {
	SEND_GAME_CREATION_NOTIFICATION: 'sendGameCreationNotification',
	SEND_INVITE_NOTIFICATION: 'sendInviteNotification',
	SEND_MOVE_NOTIFICATION: 'sendMoveNotification',
	SEND_FORGOT_GAME_ID_NOTIFICATION: 'sendForgotGameIdNotification',
	SEND_FEEDBACK_NOTIFICATION: 'sendFeedbackNotification'
};

export default eventEmitter;
