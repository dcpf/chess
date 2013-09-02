/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

function log (msg) {
    console.log(msg);
}

/*
var moveHistory = ['Pe2 e4', 'Pf7 f5', 'Pe4xf5', 'Pg7 g5', 'Pf5xg6 e.p.', 'Ph7xg6'];
for (var i in moveHistory) {
    var notation = moveHistory[i];
    var moveArray = this.notationConverter.convertNotation(this.board, notation, i);
    for (var j in moveArray) {
        var move = moveArray[j];
        this.controller.doMove(move.piece.id, move.toRow, move.toCol, false);
        this.controller.updateGameWithLatestMove(notation, move.piece.id, move.toRow, move.toCol);
    }
}
*/
