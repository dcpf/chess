'use strict';

var path = require('path');
var templateHandler = require('./templateHandler');
var nodemailer = require('nodemailer/lib/nodemailer');

var emailServiceConfig = GLOBAL.CONFIG.emailService;
var emailSrcDir = path.join(__dirname, 'email/');

var mailTransport = nodemailer.createTransport('SMTP', {
    service: emailServiceConfig.serviceName,
    auth: {
        user: emailServiceConfig.user,
        pass: emailServiceConfig.pass
    }
});

exports.sendGameCreationEmail = function (player1Email, player2Email, gameID) {

	var html = templateHandler.processTemplate(emailSrcDir + 'player1Email.html', {
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

	console.log('Sent game creation email to ' + player1Email + ' with gameID: ' + gameID.compositeID);
	
};

exports.sendInviteEmail = function (player1Email, player2Email, gameID, move) {

	var html = templateHandler.processTemplate(emailSrcDir + 'player2InviteEmail.html', {
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

	console.log('Sent game invitation email to ' + player2Email + ' with gameID: ' + gameID.compositeID);
	
};

exports.sendMoveNotificationEmail = function (playerEmail, gameID, move) {

	var html = templateHandler.processTemplate(emailSrcDir + 'moveNotificationEmail.html', {
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

	console.log('Sent move notification email to ' + playerEmail);
	
};

function _buildGameUrl (gameID) {
	return GLOBAL.APP_URL.url + '?gameID=' + gameID.compositeID;
}
