exports.getModelAndView = function (model, view) {

	this.model = model;
	this.view = view;

	this.setView = function (view) {
		this.view = view;
	};

	this.setModel = function (model) {
		this.model = model;
	};

	return this;

}