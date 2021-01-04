import HttpException from "./HttpException";

export class WrongCredentialException extends HttpException {
    constructor() {
        super(404, "Invalid account information");
    }
}
