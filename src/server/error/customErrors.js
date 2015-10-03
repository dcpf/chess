var InvalidGameIdError = function (message) {
  this.name = "InvalidGameIdError";
  this.message = message || "Invalid Game ID";
};
InvalidGameIdError.prototype = new Error();
InvalidGameIdError.prototype.constructor = InvalidGameIdError;

exports.InvalidGameIdError = InvalidGameIdError;
