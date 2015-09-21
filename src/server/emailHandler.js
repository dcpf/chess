'use strict';

var path = require('path');
var templateHandler = require('./templateHandler');
var nodemailer = require('nodemailer/lib/nodemailer');
var eventEmitter = require('./eventEmitter');

var emailServiceConfig = GLOBAL.CONFIG.emailService;
var emailSrcDir = path.join(__dirname, 'email');

var mailTransport;
if (emailServiceConfig.enabled) {
    mailTransport = createMailTransport();
} else {
    console.warn('############# Email notification is disabled! #############');
    mailTransport = {
        // Provide a no-op sendmail() function
        sendMail: function(){}
    };
}

eventEmitter.on(eventEmitter.messages.SEND_GAME_CREATION_NOTIFICATION, sendGameCreationEmail);
eventEmitter.on(eventEmitter.messages.SEND_INVITE_NOTIFICATION, sendInviteEmail);
eventEmitter.on(eventEmitter.messages.SEND_MOVE_NOTIFICATION, sendMoveNotificationEmail);
eventEmitter.on(eventEmitter.messages.SEND_FORGOT_GAME_ID_NOTIFICATION, sendForgotGameIdEmail);
eventEmitter.on(eventEmitter.messages.SEND_FEEDBACK_NOTIFICATION, sendFeedbackEmail);

function sendGameCreationEmail (player1Email, player2Email, gameID) {

	var html = templateHandler.processTemplate(`${emailSrcDir}/player1Email.html`, {
		player1Email: player1Email,
		player2Email: player2Email,
		gameID: gameID.compositeID,
		gameUrl: _buildGameUrl(gameID)
	});

	mailTransport.sendMail({
		from: emailServiceConfig.fromAddress,
		to: player1Email,
		subject: 'New Chess Game',
		html: html
	});

	console.log(`Sent game creation email to ${player1Email} with gameID: ${gameID.compositeID}`);

}

function sendInviteEmail (gameObj, gameID, move) {
    
    var player1Email = gameObj.W.email;
    var player2Email = gameObj.B.email;
    
	var html = templateHandler.processTemplate(`${emailSrcDir}/player2InviteEmail.html`, {
		player1Email: player1Email,
		gameID: gameID.compositeID,
		move: move,
		gameUrl: _buildGameUrl(gameID)
	});

	mailTransport.sendMail({
		from: emailServiceConfig.fromAddress,
		to: player2Email,
		subject: 'You have been invited to play a game of chess',
		html: html
	});

	console.log(`Sent game invitation email to ${player2Email} with gameID: ${gameID.compositeID}`);

}

function sendMoveNotificationEmail (playerEmail, gameID, move) {

	var html = templateHandler.processTemplate(`${emailSrcDir}/moveNotificationEmail.html`, {
		move: move,
		gameUrl: _buildGameUrl(gameID),
		appUrl: GLOBAL.APP_URL.url
	});

	mailTransport.sendMail({
		from: emailServiceConfig.fromAddress,
		to: playerEmail,
		subject: 'Your opponent awaits your next move',
		html: html
	});

	console.log(`Sent move notification email to ${playerEmail}`);

}

/**
* @param String email
* @param Array of game objects
*/
function sendForgotGameIdEmail (email, games) {

  var numGames = games.length,
      game,
      gameID,
      gameArray = [],
      i;

  for (i = 0; i < numGames; i++) {
    game = games[i];
    gameID = game.gameID;
    gameArray.push(
      {
        id: gameID.compositeID,
        createDate: game.createDate,
        lastMoveDate: game.lastMoveDate,
        url: _buildGameUrl(gameID)
      }
    );
  }

  var html = templateHandler.processTemplate(`${emailSrcDir}/forgotGameIdEmail.html`, {
    email: email,
    gameArray: gameArray
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: email,
    subject: `Chess games for ${email}`,
    html: html
  });

  console.log(`Sent forgot gameID email to ${email}`);

}

function sendFeedbackEmail (data) {

  // limit feedback to 1000 chars
  if (data.feedback && data.feedback.length > 1000) {
    data.feedback = data.feedback.substring(0, 1000);
  }

  var html = templateHandler.processTemplate(emailSrcDir + 'feedback.html', {
    data: data
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: emailServiceConfig.fromAddress,
    subject: 'Chess Feedback',
    html: html
  });

  console.log(`Sent feedback email to ${emailServiceConfig.fromAddress}`);

}

// private functions

function createMailTransport () {
    return nodemailer.createTransport('SMTP', {
        service: emailServiceConfig.serviceName,
        auth: {
            user: emailServiceConfig.user,
            pass: emailServiceConfig.pass
        }
    });
}

function _buildGameUrl (gameID) {
	return `${GLOBAL.APP_URL.url}/play/${gameID.compositeID}`;
}
