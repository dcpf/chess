export class InvalidGameIdError extends Error {
  name = "InvalidGameIdError";
  constructor() {
    super();
    Object.setPrototypeOf(this , new.target.prototype);
  }
}
