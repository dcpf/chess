var templateHandler = require('./templateHandler');
var nodemailer = require('nodemailer/lib/nodemailer');

var emailServiceConfig = CONFIG.emailService;

var mailTransport = nodemailer.createTransport('SMTP', {
    service: emailServiceConfig.serviceName,
    auth: {
        user: emailServiceConfig.user,
        pass: emailServiceConfig.pass
    }
});

exports.sendGameCreationEmail = function (player1Email, player2Email, gameID, key) {

	var html = templateHandler.processTemplate('html/player1Email.html', {
		player1Email: player1Email,
		player2Email: player2Email,
		gameID: gameID,
		key: key,
		gameUrl: buildGameUrl(gameID, key)
	});

	mailTransport.sendMail({
    	from: emailServiceConfig.fromAddress,
    	to: player1Email,
    	subject: 'New Chess Game',
    	html: html
	});

	console.log('Sent game creation email to ' + player1Email + ' with gameID: ' + gameID + ' and key: ' + key);
	
}

exports.sendInviteEmail = function (player1Email, player2Email, gameID, key, move) {

	var html = templateHandler.processTemplate('html/player2InviteEmail.html', {
		player1Email: player1Email,
		gameID: gameID,
		key: key,
		move: move,
		gameUrl: buildGameUrl(gameID, key)
	});

	mailTransport.sendMail({
    	from: emailServiceConfig.fromAddress,
    	to: player2Email,
    	subject: 'You have been invited to play a game of chess',
    	html: html
	});

	console.log('Sent game invitation email to ' + player2Email + ' with gameID: ' + gameID + ' and key: ' + key);
	
}

exports.sendMoveNotificationEmail = function (playerEmail, gameID, key, move) {

	var html = templateHandler.processTemplate('html/moveNotificationEmail.html', {
		move: move,
		gameUrl: buildGameUrl(gameID, key),
		appUrl: APP_URL.url
	});

	mailTransport.sendMail({
    	from: emailServiceConfig.fromAddress,
    	to: playerEmail,
    	subject: 'Your opponent awaits your next move',
    	html: html
	});

	console.log('Sent move notification email to ' + playerEmail);
	
}

function buildGameUrl (gameID, key) {
	return APP_URL.url + '?gameID=' + gameID + '&key=' + key;
}
