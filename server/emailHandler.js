var templateHandler = require('./templateHandler');
var nodemailer = require('nodemailer/lib/nodemailer');

// TODO: encrypt the gmail user/password, or maybe set up a special mail acct for the chess game.
// Or, see what the hosting svc provides.
var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: 'dpfchess',
        pass: 'dpfch355'
    }
});

exports.sendCreationEmail = function (player1Email, player2Email, gameID, key) {

	var html = templateHandler.processTemplate('html/player1Email.html', {
		player1Email: player1Email,
		player2Email: player2Email,
		gameID: gameID,
		key: key});

	// TODO: fix from address
	mailTransport.sendMail({
    	from: 'test@example.com',
    	to: player1Email,
    	subject: 'New Chess Game',
    	html: html
	});

	console.log('Sent creation email to ' + player1Email);
	
}
