import { Request, Response, NextFunction } from "express";
import { HttpException } from "@uvdesigner/common";

function errorMiddleware(error: HttpException, req: Request, res: Response, next: NextFunction) {
    const status = error.status || 500;
    const message = error.message || "Unknown error occured";
    res.status(status).send({ status, message });
}

export default errorMiddleware;
