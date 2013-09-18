var View = function (name, attrs) {
	this._name = name || '';
	this._attrs = attrs || {};
};

View.prototype.setName = function (name) {
	this._name = name;
};

View.prototype.setAttribute = function (name, value) {
	this._attrs[name] = value;
};

View.prototype.getName = function () {
	return this._name;
};

View.prototype.getAttribute = function (name) {
	return this._attrs[name];
};

View.prototype.getAttributes = function () {
	return this._attrs;
};

module.exports = View;
