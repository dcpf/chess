import { User } from './user';

export type GameIdObject = {
  id: string;
  key: string;
  compositeID: string;
};

type Player = {
  email: string;
  key: string;
};

export type GameObject = {
  W: Player;
  B: Player;
  moveHistory: string[];
};

export type PlayerColor = 'B' | 'W';

export type GameState = {
  gameID: string;
  moveHistory: string[];
  perspective: PlayerColor;
  canMove: boolean;
  whiteEmail: string;
  blackEmail: string;
  error: string;
};

export type GameContext = {
  gameState: GameState;
	user: User,
};

export type EnterGameRequest = {
	gameID: string;
};
