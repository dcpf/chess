export type SaveMoveRequest = {
	gameID: string;
	move: string;
};

export type SaveMoveResponse = {
	status: string;
	opponentEmail: string;
	move: string;
	gameID: string;
};
