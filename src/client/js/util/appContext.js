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
        appContext: this,
        config: config
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
        
        /*
            Create a new gameContext only if:
            1) gameContext does not yet exist
            2) The passed-in gameState does not match the one in the gameContext
        */
        if (!gameContext || gameContext.gameState.getGameID() !== gameStateData.gameID) {

            if (gameContext) {
                // Clean up the views so they can be properly re-instantiated
                gameContext.boardView.remove();
                gameContext.capturedPiecesView.remove();
                gameContext.feedbackDialogView.remove();
                gameContext.messagesView.remove();
                gameContext.moveHistoryView.remove();
                gameContext.optionsMenuView.remove();
                gameContext.playerInfoView.remove();
                gameContext.playGameView.remove();
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
            var feedbackDialogView = new FeedbackDialogView({
                parent: $('#feedbackDialog'),
                eventHandler: eventHandler,
                user: user
            });
            var boardView = new BoardView({
                parent: $('#chessBoardContainer'),
                eventHandler: eventHandler,
                gameState: gameState,
                board: board,
                notationConverter: notationConverter,
                user: user
            });
            var boardSnapshotView = new BoardSnapshotView({
                eventHandler: eventHandler,
                notationConverter: notationConverter,
                moveHistory: moveHistory
            });
            var confirmMoveDialogView = new ConfirmMoveDialogView({
                eventHandler: eventHandler
            });
            var optionsMenuView = new OptionsMenuView({
                parent: $('#optionsMenuContainer'),
                eventHandler: eventHandler,
                user: user
            });
            var capturedPiecesView = new CapturedPiecesView({
                parent: $('#capturedPiecesContainer'),
                capturedPieces: capturedPieces
            });
            var playerInfoView = new PlayerInfoView({
                parent: $('#playerInfoContainer'),
                gameState: gameState
            });
            var moveHistoryView = new MoveHistoryView({
                parent: $('#moveHistoryContainer'),
                eventHandler: eventHandler,
                moveHistory: moveHistory
            });
            var messagesView = new MessagesView({
                parent: $('#messageContainer'),
                eventHandler: eventHandler,
                board: board
            });
            var playGameView = new PlayGameView({
                parent: $('#playGameView')
            });

            gameContext = {
                notationConverter: notationConverter,
                capturedPieces: capturedPieces,
                moveHistory: moveHistory,
                user: user,
                gameState: gameState,
                board: board,
                feedbackDialogView: feedbackDialogView,
                boardView: boardView,
                boardSnapshotView: boardSnapshotView,
                confirmMoveDialogView: confirmMoveDialogView,
                optionsMenuView: optionsMenuView,
                capturedPiecesView: capturedPiecesView,
                moveHistoryView: moveHistoryView,
                messagesView: messagesView,
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
    }

};
