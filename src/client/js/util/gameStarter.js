/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

// Instantiate the appContext
var appContext = AppContext.getAppContext();

/*
 If the page has loaded with a gameID, start the game. This will occur when the gameID is passed in as either:
 
 - /play/531d080566b22a611f1-82197
 or
 - ?gameID=531d080566b22a611f1-82197

 Else, show the enterGame view.
*/
if (chessAttrs.vars.gameID && !chessAttrs.vars.error) {
  appContext.gameManager.startGame();
} else {
  appContext.enterGameView.show(chessAttrs.vars.error);
}
