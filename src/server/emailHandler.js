'use strict';

const path = require('path');
const templateHandler = require('./templateHandler');
const nodemailer = require('nodemailer/lib/nodemailer');
const eventEmitter = require('./eventEmitter');

const emailServiceConfig = global.CONFIG.emailService;
const emailSrcDir = path.join(__dirname, 'email');

let mailTransport;
if (emailServiceConfig.enabled) {
  mailTransport = nodemailer.createTransport('SMTP', {
    service: emailServiceConfig.serviceName,
    auth: {
      user: emailServiceConfig.user,
      pass: emailServiceConfig.pass
    }
  });
} else {
  console.warn('############# Email notification is disabled! #############');
  mailTransport = {
    // Provide a no-op sendmail() function
    sendMail: function () { }
  };
}

const buildGameUrl = (gameID) => {
  return `${global.APP_URL.url}/play/${gameID.compositeID}`;
};

const sendGameCreationEmail = (player1Email, player2Email, gameID) => {

  const html = templateHandler.processTemplate(`${emailSrcDir}/player1Email.html`, {
    player1Email,
    player2Email,
    gameID: gameID.compositeID,
    gameUrl: buildGameUrl(gameID)
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: player1Email,
    subject: 'New Chess Game',
    html
  });

  console.log(`Sent game creation email to ${player1Email} with gameID: ${gameID.compositeID}`);

};

const sendInviteEmail = (gameObj, gameID, move) => {

  const player1Email = gameObj.W.email;
  const player2Email = gameObj.B.email;

  const html = templateHandler.processTemplate(`${emailSrcDir}/player2InviteEmail.html`, {
    player1Email,
    gameID: gameID.compositeID,
    move,
    gameUrl: buildGameUrl(gameID)
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: player2Email,
    subject: 'You have been invited to play a game of chess',
    html
  });

  console.log(`Sent game invitation email to ${player2Email} with gameID: ${gameID.compositeID}`);

}

const sendMoveNotificationEmail = (playerEmail, gameID, move) => {

  const html = templateHandler.processTemplate(`${emailSrcDir}/moveNotificationEmail.html`, {
    move,
    gameUrl: buildGameUrl(gameID),
    appUrl: global.APP_URL.url
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: playerEmail,
    subject: 'Your opponent awaits your next move',
    html
  });

  console.log(`Sent move notification email to ${playerEmail}`);

};

/**
* @param String email
* @param Array of game objects
*/
const sendForgotGameIdEmail = (email, games) => {

  const numGames = games.length;
  const gameArray = [];

  for (let i = 0; i < numGames; i++) {
    const game = games[i];
    const gameID = game.gameID;
    gameArray.push(
      {
        id: gameID.compositeID,
        createDate: game.createDate,
        lastMoveDate: game.lastMoveDate,
        url: buildGameUrl(gameID)
      }
    );
  };

  const html = templateHandler.processTemplate(`${emailSrcDir}/forgotGameIdEmail.html`, {
    email,
    gameArray
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: email,
    subject: `Chess games for ${email}`,
    html
  });

  console.log(`Sent forgot gameID email to ${email}`);

};

const sendFeedbackEmail = (data) => {

  // limit feedback to 1000 chars
  if (data.feedback && data.feedback.length > 1000) {
    data.feedback = data.feedback.substring(0, 1000);
  }

  const html = templateHandler.processTemplate(emailSrcDir + 'feedback.html', {
    data
  });

  mailTransport.sendMail({
    from: emailServiceConfig.fromAddress,
    to: emailServiceConfig.fromAddress,
    subject: 'Chess Feedback',
    html
  });

  console.log(`Sent feedback email to ${emailServiceConfig.fromAddress}`);

};

eventEmitter.on(eventEmitter.messages.SEND_GAME_CREATION_NOTIFICATION, sendGameCreationEmail);
eventEmitter.on(eventEmitter.messages.SEND_INVITE_NOTIFICATION, sendInviteEmail);
eventEmitter.on(eventEmitter.messages.SEND_MOVE_NOTIFICATION, sendMoveNotificationEmail);
eventEmitter.on(eventEmitter.messages.SEND_FORGOT_GAME_ID_NOTIFICATION, sendForgotGameIdEmail);
eventEmitter.on(eventEmitter.messages.SEND_FEEDBACK_NOTIFICATION, sendFeedbackEmail);
