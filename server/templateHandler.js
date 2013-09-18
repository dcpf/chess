var fs = require('fs');
var underscore = require('underscore/underscore');

exports.processTemplate = function (filename, attrs) {
	var template = fs.readFileSync(filename, {encoding: 'utf8'});
	var compiled = underscore.template(template);
	var html = compiled(attrs);
	return html;
};
