const Templates = function(){
this["JST"] = this["JST"] || {};

this["JST"]["capturedPieces"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<fieldset id="capturedPiecesFieldset">\n<legend>Captured Pieces</legend>\n<div id="capturedBlackPieces"></div>\n<div id="capturedWhitePieces"></div>\n</fieldset>';
return __p
};

this["JST"]["chessBoardSnapshotDialog"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div id="chessBoardSnapshotDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-body">\n<div style="text-align: right"><a href="#" class="closeIcon">Close</a></div>\n<div class="move"></div>\n<div id="chessBoardSnapshotContainer"></div>\n</div>\n<div id="tempPiecePlaceHolder"></div>\n</div>';
return __p
};

this["JST"]["confirmMoveDialog"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div id="confirmMoveDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-body">\n<p>Please confirm your move</p>\n<div id="possibleMoves"></div>\n</div>\n</div>';
return __p
};

this["JST"]["enterGame"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<h3>Welcome to Dave\'s <span style="white-space: nowrap">Chess-By-Email</span></h3>\n<hr/>\n<div id="enterGameTable">\n<input type="radio" name="newOrExisting" id="newGameRadio" value="N" tabindex="-1" checked><label for="newGameRadio" style="font-weight: bold">New Game</label>\n<div id="newGameForm">\n<fieldset>\n<label class="sr-only" for="player1Email">Your Email Address</label>\n<input type="email" class="form-control" id="player1Email" maxlength="50" required placeholder="Your Email Address">\n<label class="sr-only" for="player2Email">Opponent\'s Email Address</label>\n<input type="email" class="form-control" id="player2Email" maxlength="50" required placeholder="Opponent\'s Email Address">\n<div id="loadingCaptchaText">Loading Captcha ...</div>\n<div class="g-recaptcha" data-sitekey="' +
((__t = ( data.siteKey )) == null ? '' : __t) +
'"></div>\n</fieldset>\n</div>\n<hr/>\n<input type="radio" name="newOrExisting" id="existingGameRadio" value="E" tabindex="-1"><label for="existingGameRadio" style="font-weight: bold">Continue Existing Game</label>\n<div id="existingGameForm">\n<fieldset>\n<label class="sr-only" for="gameID">Game ID</label>\n<input type="text" class="form-control" id="gameID" required placeholder="Game ID">\n<div><a href="#" id="forgotGameIdLink" tabindex="-1">Forgot your game ID?</a></div>\n</fieldset>\n</div>\n<hr/>\n<div style="text-align: center">\n<button type="button" class="btn btn-primary" id="enterGameSubmitButton" style="margin-right: 10px" tabindex="-1">Submit</button>\n<button type="reset" class="btn" tabindex="-1">Clear</button>\n</div>\n</div>';
return __p
};

this["JST"]["feedbackDialog"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div id="feedbackDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-header">\n<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n<h3 style="border-bottom: 1px solid #000; padding-bottom: 10px;">Feedback</h3>\n</div>\n<div class="modal-body" style="padding: 10px 20px 15px 20px">\n<div id="feedbackForm">\n<p>Please enter your feedback (comments, bug report, etc) and email address, and click Submit.</p>\n<fieldset>\n<div>\n<label class="control-label" for="feedbackText">Feedback</label>\n<textarea class="form-control" id="feedbackText" style="height: 100px"></textarea>\n</div>\n<div>\n<label class="control-label" for="feedbackText">Email</label>\n<input type="email" class="form-control" id="feedbackEmail" maxlength="50" value="' +
((__t = ( data.email )) == null ? '' : __t) +
'">\n</div>\n</fieldset>\n<div style="margin: 10px">\n<button type="button" class="btn btn-primary" id="feedbackSubmitButton" style="margin-right: 10px">Submit</button>\n<button type="button" class="btn" data-dismiss="modal">Close</button>\n</div>\n</div>\n<div id="feedbackSuccess" style="display: none">\n<p>Thanks for your feedback!</p>\n<button type="button" class="btn" data-dismiss="modal">Close</button>\n</div>\n</div>\n</div>';
return __p
};

this["JST"]["forgotGameIdDialog"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div id="forgotGameIdDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-header">\n<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n<h3 style="border-bottom: 1px solid #000; padding-bottom: 10px;">Forgot your game ID?</h3>\n</div>\n<div class="modal-body" style="padding: 10px 20px 15px 20px">\n<div id="forgotGameIdForm">\n<p>Please enter your email address and click Submit</p>\n<p><input type="email" class="form-control" id="forgotGameIdEmail" maxlength="50" required></p>\n<p id="forgotGameIdError" style="display: none; color: red"></p>\n<p>\n<button type="button" class="btn btn-primary" id="forgotGameIdSubmitButton" style="margin-right: 10px">Submit</button>\n<button type="button" class="btn" data-dismiss="modal">Close</button>\n</p>\n</div>\n<div id="forgotGameIdSuccess" style="display: none">\n<p>An email with your game IDs has been sent to <span class="forgotGameIdEmail"></span></p>\n<button type="button" class="btn" data-dismiss="modal">Close</button>\n</div>\n</div>\n</div>';
return __p
};

this["JST"]["genericDialog"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div id="genericDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-header">\n<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n<p style="margin-bottom: 20px">&nbsp;</p>\n</div>\n<div class="modal-body" style="padding: 0 20px 15px 20px">\n<p class="genericDialogText"></p>\n</div>\n</div>';
return __p
};

this["JST"]["index"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<!DOCTYPE html>\n<!-- Copyright (c) 1998 - 2013 dpf, dpf@theworld.com -->\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="description" content="Dave\'s Chess-By-Email - Internet Correspondence Chess">\n<meta name="keywords" content="chess-by-email, chess by email, play chess, correspondence chess">\n<meta name="author" content="David Piersol-Freedman 1998">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Dave\'s Chess-By-Email</title>\n<link rel="shortcut icon" href="/webapp/images/favicon.ico" type="image/x-icon">\n<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">\n<link rel="stylesheet" href="/webapp/chess.css?ver=' +
((__t = ( runtimestamp )) == null ? '' : __t) +
'">\n</head>\n<body><!-- Create/enter view -->\n<div id="enterGameView" style="display: none"></div><!-- Play game view-->\n<div id="playGameView"><div id="optionsMenuContainer"></div><div style="display: inline-block; vertical-align: top">\n<div id="playerInfoContainer"></div>\n<div id="moveHistoryContainer"></div>\n</div><div style="display: inline-block; vertical-align: top">\n<div id="messageContainer"></div>\n<div id="chessBoardContainer"></div>\n<div id="capturedPiecesContainer"></div>\n</div></div></body><!-- dialogs --><div id="progressDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-body">\n<div id="spinner">&#9816;</div>\n</div>\n</div><div id="dialogsContainer"></div><script>window.onerror = function (msg, url, lineNum) {\nconst xhr = new XMLHttpRequest();\nxhr.open(\'POST\', \'/logClientError\', true);\nconst params = \'msg=\' + encodeURIComponent(msg) + \'&url=\' + encodeURIComponent(url) + \'&lineNum=\' + lineNum;\nxhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");\nxhr.send(params);\n};function log (msg) {\nif (window.console) {\nconsole.log(msg);\n}\n}const chessAttrs = {\nconfig: ' +
((__t = ( config )) == null ? '' : __t) +
'\n};</script><script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>\n<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js"></script>\n<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"></script>\n<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>\n<script src="//cdn.socket.io/socket.io-1.2.1.js"></script>\n<script src="/webapp/chess.js?ver=' +
((__t = ( runtimestamp )) == null ? '' : __t) +
'"></script></html>';
return __p
};

this["JST"]["moveHistory"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div>\n<div id="replayGameLink"><a href="#">Auto-Replay</a></div>\n<table id="moveHistoryTable">\n<tr>\n<th style="border-bottom: none; width: 20px;"></th>\n<th style="border-right: solid 1px #000" class="currentPlayer">White</th>\n<th>Black</th>\n</tr>\n</table>\n</div>';
return __p
};

this["JST"]["opponentHasMovedDialog"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div id="opponentHasMovedDialog" class="modal" role="dialog" aria-hidden="true" data-backdrop="static">\n<div class="modal-header">\n<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n<h3 style="border-bottom: 1px solid #000; padding-bottom: 10px;">Your opponent has moved!</h3>\n</div>\n<div class="modal-body" style="padding: 10px 20px 15px 20px">\n<p>Your opponent has made the following move:</p>\n<p class="bold" id="move"></p>\n<a href="#" id="updateBoardWithOpponentsMoveLink">Update the board with your opponent\'s latest move</a>\n</div>\n</div>';
return __p
};

this["JST"]["optionsMenu"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div>\n<div id="optionsMenuIcon" title="Options">\n<div></div>\n<div></div>\n<div></div>\n</div>\n<div id="optionsMenu">\n<ul>\n<li id="showLegalMovesOption"><a href="#">Show legal moves:</a> <span id="showLegalMovesValue"></span></li>\n<li id="feedbackOption"><a href="#">Feedback</a></li>\n<li><a href="/">Start new game</a></li>\n<li>Other Games</li>\n<ul>\n<li><a href="http://world.std.com/~dpf/tetris.html" target="_blank">Tetris</a></li>\n<li><a href="http://world.std.com/~dpf/sudoku/" target="_blank">Sudoku</a></li>\n</ul>\n</ul>\n</div>\n</div>';
return __p
};

this["JST"]["playerInfo"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<div>\n<div><b>White:</b> ' +
((__t = ( data.whiteEmail )) == null ? '' : __t) +
' <span class="onlineStatus" data-toggle="tooltip" title="test1">&bullet;</span></div>\n<div><b>Black:</b> ' +
((__t = ( data.blackEmail )) == null ? '' : __t) +
' <span class="onlineStatus" data-toggle="tooltip" title="test2">&bullet;</span></div>\n</div>';
return __p
};
};
