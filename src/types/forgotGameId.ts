export type ForgotGameIdEmailGameData = {
  id: string;
  createDate: string;
  lastMoveDate: string;
  url: string;
};

export type FindGamesByEmailResponse = {
	status: string;
	email: string;
};
