import { AccountDatabase } from "../db/account.db";
import AuthenticationTokenMissingException from "../exception/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exception/WrongAuthenticationTokenException";
import { NextFunction, Response } from "express";
import RequestWithAccount from "../interfaces/requestWithUser.interface";
import * as jwt from "jsonwebtoken";
import { DataStoredInToken } from "../authentication/authentication.dto";
import Environment from "../shared/environment";

async function authMiddleware(request: RequestWithAccount, _: Response, next: NextFunction) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        try {
            const secret = Environment.jwtSecret;
            const verifyResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
            const db = new AccountDatabase();
            const user = await db.getAccountbyId(verifyResponse.id);
            if (user) {
                request.account = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new AuthenticationTokenMissingException());
    }
}

export default authMiddleware;
