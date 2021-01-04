import HttpException from "./HttpException";

export class UVDException extends HttpException {
    constructor(message: string) {
        super(404, message);
    }
}
