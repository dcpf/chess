/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var AppContext = function (configData) {

    var enterScreenContext;
    var gameContext;
    
    // define some common objects
    var config = new Config(configData);
    var eventHandler = new EventHandler();
    var gameManager = new GameManager({
        eventHandler: eventHandler,
        appContext: this
    });
    var router = new Router({
        gameManager: gameManager
    });
    var genericDialogView = new GenericDialogView({
        eventHandler: eventHandler
    });
    
    this.getEnterScreenContext = function () {
        
        enterScreenContext = enterScreenContext || {
            enterGameView: new EnterGameView({
                parent: $('#enterGameView'),
                eventHandler: eventHandler,
                config: config
            }),
            forgotGameIdDialogView: new ForgotGameIdDialogView({
                eventHandler: eventHandler
            })
        };
    
        return {
            render: function (errMsg) {
                enterScreenContext.enterGameView.render(errMsg);
            }
        };
        
    };
    

    this.getGameContext = function (userData, gameStateData) {
        
        if (userData && gameStateData) {
            instantiateGameContext(userData, gameStateData);
        }
        
        if (!gameContext) {
            return null;
        }
        
        return {
            
            /**
            * @param doNavigate - pass in true to tell the router to update the URL
            */
            render: function (doNavigate) {
                
                var gameState = gameContext.gameState;

                // close all open dialogs
                $(".modal[role='dialog']").modal('hide');

                // render the board
                gameContext.boardView.render(gameState.getPerspective());
                gameContext.playGameView.render();
                
                eventHandler.trigger(eventHandler.messageNames.GAME_ENTERED);
                
                if (doNavigate) {
                    router.navigateToPlay(gameState.getGameID());
                }
                
            },
            
            hide: function () {
                gameContext.playGameView.hide();
            },
            
            getGameID: function () {
                return gameContext.gameState.getGameID();
            }
        };

    };
    
    function instantiateGameContext (userData, gameStateData) {

        // First, see if this is an existing game or a new game.
        var isExistingGame;
        if (gameContext && gameContext.gameState.getGameID() === gameStateData.gameID) {
            isExistingGame = true;
        }

        // Instantiate the socketIO object, but only if this is a new game.
        if (!isExistingGame) {
            var playerEmail = userData.email;
            var opponentEmail = (gameStateData.whiteEmail === playerEmail) ? gameStateData.blackEmail : gameStateData.whiteEmail;
            new SocketIO({
                eventHandler: eventHandler,
                url: config.getAppUrl(),
                gameID: gameStateData.gameID,
                playerEmail: playerEmail,
                opponentEmail: opponentEmail
            });
        }

        if (gameContext) {
            // Clean up the views so they can be properly re-instantiated
            for (var prop in gameContext) {
                if (isExistingGame && prop === 'playerInfoView') {
                    // If this is an existing game, we don't want to re-instantiate the playerInfoView.
                    continue;
                }
                if (prop.match(/.+View$/) && gameContext[prop].remove) {
                    gameContext[prop].remove();
                }
            }
        }

        // Instantiate all of the objects we need

        // This is a singleton
        var notationConverter = gameContext ? gameContext.notationConverter : new NotationConverter();

        // The rest need to be instantiated anew
        var capturedPieces = new CapturedPieces();
        var moveHistory = new MoveHistory();
        var user = new User(userData);
        var gameState = new GameState(gameStateData);
        var board = new Board({
            eventHandler: eventHandler,
            notationConverter: notationConverter,
            capturedPieces: capturedPieces,
            moveHistory: moveHistory
        });
        var boardSnapshotView = new BoardSnapshotView({
            eventHandler: eventHandler,
            notationConverter: notationConverter,
            moveHistory: moveHistory
        });
        var boardView = new BoardView({
            parent: $('#chessBoardContainer'),
            eventHandler: eventHandler,
            gameState: gameState,
            board: board,
            notationConverter: notationConverter,
            user: user
        });
        var capturedPiecesView = new CapturedPiecesView({
            parent: $('#capturedPiecesContainer'),
            capturedPieces: capturedPieces
        });
        var confirmMoveDialogView = new ConfirmMoveDialogView({
            eventHandler: eventHandler
        });
        var feedbackDialogView = new FeedbackDialogView({
            eventHandler: eventHandler,
            user: user
        });
        var messagesView = new MessagesView({
            parent: $('#messageContainer'),
            eventHandler: eventHandler,
            board: board
        });
        var moveHistoryView = new MoveHistoryView({
            parent: $('#moveHistoryContainer'),
            eventHandler: eventHandler,
            moveHistory: moveHistory
        });
        var opponentHasMovedDialogView = new OpponentHasMovedDialogView({
            eventHandler: eventHandler
        });
        var optionsMenuView = new OptionsMenuView({
            parent: $('#optionsMenuContainer'),
            eventHandler: eventHandler,
            user: user
        });
        var playGameView = new PlayGameView({
            parent: $('#playGameView')
        });

        // Only instantiate the playerInfoView for a new game
        var playerInfoView = isExistingGame ? gameContext.playerInfoView : null;
        if (!playerInfoView) {
            playerInfoView = new PlayerInfoView({
                parent: $('#playerInfoContainer'),
                eventHandler: eventHandler,
                gameState: gameState
            });
        }

        gameContext = {
            notationConverter: notationConverter,
            capturedPieces: capturedPieces,
            moveHistory: moveHistory,
            user: user,
            gameState: gameState,
            board: board,
            boardSnapshotView: boardSnapshotView,
            boardView: boardView,
            capturedPiecesView: capturedPiecesView,
            confirmMoveDialogView: confirmMoveDialogView,
            feedbackDialogView: feedbackDialogView,
            messagesView: messagesView,
            moveHistoryView: moveHistoryView,
            optionsMenuView: optionsMenuView,
            opponentHasMovedDialogView: opponentHasMovedDialogView,
            playerInfoView: playerInfoView,
            playGameView: playGameView
        };

        // Perform some init functions

        // If there is an existing move history, use it to get the game into the current state
        var moveHistoryArray = gameState.getMoveHistory();
        for (var i in moveHistoryArray) {
            var notation = moveHistoryArray[i];
            board.updateGameState(notation);
        }

        // Update the legal moves
        board.findAllLegalMoves();

        // make sure viewMode is set accordingly based on canMove
        boardView.viewMode = !gameState.canMove();

    }

};
