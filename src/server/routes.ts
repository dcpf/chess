import { NextFunction, Request, Response } from 'express';
import { FeedbackData } from '../types';
import * as chessController from './chessController';

export const index = (_req: Request, res: Response, next: NextFunction) => {
	res.responseProps.file = 'index';
	// add the game config (as a string) needed by the client
	res.responseProps.obj = { config: JSON.stringify(getGameConfig()) };
	next();
};

export const findGamesByEmail = (req: Request, res: Response, next: NextFunction) => {
	res.responseProps.promise = chessController.findGamesByEmail(req.getParam('email') as string);
	next();
};

export const createGame = (req: Request, res: Response, next: NextFunction) => {
	res.responseProps.promise = chessController.createGame(req.getParams());
	next();
};

export const enterGame = (req: Request, res: Response, next: NextFunction) => {
	res.responseProps.promise = chessController.enterGame(req.getParams());
	next();
};

export const saveMove = (req: Request, res: Response, next: NextFunction) => {
	res.responseProps.promise = chessController.saveMove(req.getParams());
	next();
};

export const updateUserPrefs = (req: Request, res: Response, next: NextFunction) => {
	res.responseProps.promise = chessController.updateUserPrefs(req.getParams());
	next();
};

export const sendFeedback = (req: Request, _res: Response, next: NextFunction) => {
	const params: FeedbackData = {
		...req.getParams(),
	  userAgent: req.headers['user-agent'],
	};
	chessController.sendFeedback(params);
	next();
};

export const logClientError = (req: Request, _res: Response, next: NextFunction) => {
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
