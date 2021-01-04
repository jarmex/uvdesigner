import HttpException from "./HttpException";

export class UserAlreadyExistException extends HttpException {
    constructor(username: string) {
        super(404, `The account '${username}' already exist.`);
    }
}
