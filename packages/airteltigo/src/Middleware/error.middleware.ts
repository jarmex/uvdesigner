import { Request, Response, NextFunction } from "express";
import HttpException from "../Exceptions/HttpException";

function errorMiddleware(
  error: HttpException,
  _: Request, // the request variable is not used
  resp: Response,
  __: NextFunction // the next variable is not used
) {
  const status = error.status || 500;
  const message = error.message || "Unknown error has occurred";
  resp.status(status).send(message);
}

export default errorMiddleware;
