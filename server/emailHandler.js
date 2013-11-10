var templateHandler = require('./templateHandler');
var nodemailer = require('nodemailer/lib/nodemailer');

var FROM_ADDRESS = 'dpfchess@gmail.com';

// TODO: encrypt the gmail user/password, or see what the hosting svc provides.
var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: 'dpfchess',
        pass: 'dpfch355'
    }
});

exports.sendGameCreationEmail = function (player1Email, player2Email, gameID, key) {

	var html = templateHandler.processTemplate('html/player1Email.html', {
		player1Email: player1Email,
		player2Email: player2Email,
		appUrl: APP_URL.url,
		gameID: gameID,
		key: key});

	mailTransport.sendMail({
    	from: FROM_ADDRESS,
    	to: player1Email,
    	subject: 'New Chess Game',
    	html: html
	});

	console.log('Sent game creation email to ' + player1Email + ' with gameID: ' + gameID + ' and key: ' + key);
	
}

exports.sendInviteEmail = function (player1Email, player2Email, gameID, key, move) {

	var html = templateHandler.processTemplate('html/player2InviteEmail.html', {
		player1Email: player1Email,
		appUrl: APP_URL.url,
		gameID: gameID,
		key: key,
		move: move});

	mailTransport.sendMail({
    	from: FROM_ADDRESS,
    	to: player2Email,
    	subject: 'You have been invited to play a game of chess',
    	html: html
	});

	console.log('Sent game invitation email to ' + player2Email + ' with gameID: ' + gameID + ' and key: ' + key);
	
}

exports.sendMoveNotificationEmail = function (playerEmail, gameID, key, move) {

	var html = templateHandler.processTemplate('html/moveNotificationEmail.html', {
		appUrl: APP_URL.url,
		gameID: gameID,
		key: key,
		move: move});

	mailTransport.sendMail({
    	from: FROM_ADDRESS,
    	to: playerEmail,
    	subject: 'Your opponent awaits your next move',
    	html: html
	});

	console.log('Sent move notification email to ' + playerEmail);
	
}
