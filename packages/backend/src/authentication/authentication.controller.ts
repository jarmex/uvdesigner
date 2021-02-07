import { AccountDatabase, AccountData } from "../db";
import { Router, Request, Response, NextFunction } from "express";
import { validationMiddleware } from "../middleware/validation.middleware";
import { IController, WrongCredentialException } from "@uvdesigner/common";
import { CreateAccountDto, DataStoredInToken, LoginDto, TokenData } from "./authentication.dto";
import * as bcrypt from "bcrypt";
import { HttpException, UserAlreadyExistException } from "@uvdesigner/common";
import * as jwt from "jsonwebtoken";
import { getLogger, Logger } from "../utils";
import Environment from "../shared/environment";
import { v4 } from "uuid";

export class AuthenticationController implements IController {
    public path: string = "/auth";
    public router: Router = Router();
    private db: AccountDatabase;
    private logger: Logger;

    constructor() {
        this.logger = getLogger("auth");
        this.db = new AccountDatabase();
        this.initRoutes();
    }
    public initRoutes() {
        this.router.post(this.path, validationMiddleware(LoginDto), this.login);
        this.router.post(`${this.path}/register`, validationMiddleware(CreateAccountDto), this.createAccount);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }
    private loggingOut = (_: Request, response: Response) => {
        response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
        response.send(200);
    };

    login = async (req: Request, resp: Response, next: NextFunction) => {
        const lgdto: LoginDto = req.body;
        try {
            const user = await this.db.getAccount(lgdto.username);
            if (user != null) {
                const isPasswordMatching = await bcrypt.compare(lgdto.password, user.password);
                if (isPasswordMatching) {
                    const tokenData = this.createToken(user);
                    resp.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
                    resp.status(200).send({
                        status: 0,
                        message: { id: user.id, createdDate: user.createdDate },
                    });
                } else {
                    this.logger.error(`Invalid credentials for ${lgdto.username}`);
                    next(new WrongCredentialException());
                }
            } else {
                // check if there is not account created
                if (lgdto.username === "administrator" && lgdto.password === "intelligo") {
                    // create a temporary username in the database
                    const createdBy = v4();
                    const result = await this.db.setTempAccount(createdBy);
                    if (result === false) {
                        next(new HttpException(404, "Temporary account disabled"));
                        return;
                    }
                    this.logger.info("Require password change");
                    // login success. request user to change password
                    resp.status(200).send({
                        status: -1,
                        id: createdBy,
                        message: "Require password change",
                    });
                } else {
                    next(new WrongCredentialException());
                }
            }
        } catch (error) {
            next(new HttpException(404, error.message));
        }
    };

    createAccount = async (req: Request, resp: Response, next: NextFunction) => {
        try {
            const userData: CreateAccountDto = req.body;
            const userExist = await this.db.getAccount(userData.username);
            if (userExist) {
                next(new UserAlreadyExistException(userData.username));
                return;
            }
            if (!userData.createdBy) {
                next(new HttpException(404, "You are not authorized to created an account"));
                return;
            }
            const getAuthorizedUser = await this.db.getAccount(userData.createdBy);
            if (getAuthorizedUser === null) {
                // if the authorized user does not exist. check the temp user.
                const getCreatedBy = await this.db.getTempCreatedBy();
                if (getCreatedBy !== userData.createdBy) {
                    next(new HttpException(404, "You are not authorized to created an account"));
                    return;
                }
                // change temp account to avoid users abusing the same id
                await this.db.changeTempAccount(v4());
            }
            // check if the user exist
            this.logger.debug(`Creating account for ${userData.username}`);
            const hashpwd = await bcrypt.hash(userData.password, 10);
            const acnt = await this.db.addAccount(userData.username, hashpwd);
            const tokenData = this.createToken(acnt);
            resp.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
            resp.send({
                status: 0,
                message: { id: acnt.id, createdDate: acnt.createdDate, username: acnt.username },
            });
        } catch (error) {
            this.logger.error("Failed to created account", error);
            next(new HttpException(404, error.message));
        }
    };

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private createToken(user: AccountData): TokenData {
        const expiresIn = 24 * 60 * 60; // 24 hours
        const dataStoredInToken: DataStoredInToken = {
            username: user.username,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, Environment.jwtSecret, { expiresIn }),
        };
    }
}
