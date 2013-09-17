var fs = require('fs');
var nodemailer = require('nodemailer/lib/nodemailer');
var underscore = require('underscore/underscore');

// TODO: encrypt the gmail user/password, or maybe set up a special mail acct for the chess game.
// Or, see what the hosting svc provides.
var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: 'david.piersol.freedman@gmail.com',
        pass: 'g00g13'
    }
});

exports.sendCreationEmail = function (player1Email, player2Email, gameID, key) {

	var template = fs.readFileSync('html/player1Email.html', {encoding: 'utf-8'});
	var compiled = underscore.template(template);
	var html = compiled({
		player1Email: player1Email,
		player2Email: player2Email,
		gameID: gameID,
		key: key}
	);

	// TODO: fix from address
	mailTransport.sendMail({
    	from: 'test@example.com',
    	to: player1Email,
    	subject: 'New Chess Game',
    	html: html
	});

	console.log('Sent creation email to ' + player1Email);
	
}
