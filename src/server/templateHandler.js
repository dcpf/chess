'use strict';

var fs = require('fs');
var _ = require('underscore/underscore');

var templateCache = {};

exports.processTemplate = function (filename, attrs) {
	var template = templateCache[filename];
	if (!template) {
		console.log('Getting ' + filename + ' template from disk');
		let file = fs.readFileSync(filename, {encoding: 'utf8'});
		template = _.template(file);
		templateCache[filename] = template;
	}
	var html = template(attrs);
	return html;
};
