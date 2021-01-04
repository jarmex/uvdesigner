import HttpException from "./HttpException";

class USSDException extends HttpException {
    constructor(message: string) {
        super(404, message);
    }
}
export default USSDException;
