import { GameIdObject } from "../types";

export function constructAppUrl(domain: string, port: string, usePortInLinks: boolean) {

	let url = `http://${domain}`;
	if (usePortInLinks && port) {
		url += ':' + port;
	}

	return {
		domain,
		port,
		url,
	};

};

export const buildGameUrl = (gameID: GameIdObject): string => {
  return `${global.APP_URL.url}/play/${gameID.compositeID}`;
};
