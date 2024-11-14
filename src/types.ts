export type CreateGameRequest = {
  player1Email: string;
  player2Email: string;
};

export type GameIdObject = {
  id: string;
  key: string;
  compositeID: string;
};

type Player = {
  email: string;
  key: string;
};

export type Move = {
  gameID: string;
  mmove: string;
};

export type GameObject = {
  W: Player;
  B: Player;
  moveHistory?: Move[];
};

export type SetUserPrefRequest = {
  userEmail: string;
  name: string;
  value: unknown;
};

export type UserPrefs = Record<string, unknown>;

export type ForgotGameIdEmailGameData = {
  id: string;
  createDate: string;
  lastMoveDate: string;
  url: string;
};
