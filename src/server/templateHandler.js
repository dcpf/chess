'use strict';

const fs = require('fs');
const _ = require('underscore/underscore');

const templateCache = {};

exports.processTemplate = function (filename, attrs) {
	let template = templateCache[filename];
	if (!template) {
		console.log(`Getting ${filename} template from disk`);
		const file = fs.readFileSync(filename, {encoding: 'utf8'});
		template = _.template(file);
		templateCache[filename] = template;
	}
	return template(attrs);
};
