import * as chessController from './chessController';

export const index = (_req, res, next) => {
	res.responseProps.file = 'index';
	// add the game config (as a string) needed by the client
	res.responseProps.obj = { config: JSON.stringify(getGameConfig()) };
	next();
};

export const findGamesByEmail = (req, res, next) => {
	res.responseProps.promise = chessController.findGamesByEmail(req.getParam('email'));
	next();
};

export const createGame = (req, res, next) => {
	res.responseProps.promise = chessController.createGame(req.getParams());
	next();
};

export const enterGame = (req, res, next) => {
	res.responseProps.promise = chessController.enterGame(req.getParams());
	next();
};

export const saveMove = (req, res, next) => {
	res.responseProps.promise = chessController.saveMove(req.getParams());
	next();
};

export const updateUserPrefs = (req, res, next) => {
	res.responseProps.promise = chessController.updateUserPrefs(req.getParams());
	next();
};

export const sendFeedback = (req, _res, next) => {
	const params = req.getParams();
	params.userAgent = req.headers['user-agent'];
	chessController.sendFeedback(params);
	next();
};

export const logClientError = (req, _res, next) => {
	console.log(`Client error: ${JSON.stringify(req.getParams())}; User agent: ${req.headers['user-agent']}`);
	next();
};

const getGameConfig = () => {
	return {
		recaptcha: {
			enabled: global.CONFIG.recaptcha.enabled,
			publicKey: global.CONFIG.recaptcha.publicKey
		},
		appUrl: global.APP_URL.url
	};
};
