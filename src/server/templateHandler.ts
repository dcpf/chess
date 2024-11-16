const fs = require('fs');
const underscore = require('underscore/underscore');

const templateCache: Record<string, Function> = {};

export const processTemplate = (filename: string, attrs: Record<string, unknown>): string => {
	let template = templateCache[filename];
	if (!template) {
		console.log(`Getting ${filename} template from disk`);
		const file = fs.readFileSync(filename, { encoding: 'utf8' });
		template = underscore.template(file);
		templateCache[filename] = template;
	}
	return template(attrs);
};
