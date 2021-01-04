import { AccountDatabase, AccountData } from "../db";
import { WrongCredentialException } from "../exception/WrongCredentialException";
import { Router, Request, Response, NextFunction } from "express";
import { validationMiddleware } from "../middleware/validation.middleware";
import { IController } from "../types";
import { CreateAccountDto, DataStoredInToken, LoginDto, TokenData } from "./authentication.dto";
import * as bcrypt from "bcrypt";
import { UserAlreadyExistException } from "../exception/UserAlreadyExistException";
import * as jwt from "jsonwebtoken";
import { getLogger, Logger } from "../utils";
import HttpException from "../exception/HttpException";
import Environment from "../shared/environment";
import { v4 } from "uuid";

export class AuthenticationController implements IController {
    public path: string = "/auth";
    public router: Router = Router();
    private db: AccountDatabase;
    private logger: Logger;
    private tempId: string;

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
                //this.logger.debug(user);
                // compare the password
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
                if ((await this.db.getAccountLength()) !== 0) {
                    next(new WrongCredentialException());
                } else if (lgdto.username === "administrator" && lgdto.password === "intelligo") {
                    this.tempId = v4();
                    this.logger.info("Require password change");
                    // login success. request user to change password
                    resp.status(200).send({
                        status: -1,
                        id: this.tempId,
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
            if (userData.username === "administrator" && userData.password === "intelligo") {
                this.logger.info("User is saving the same temporary account");
                next(new UserAlreadyExistException(userData.username));
            } else {
                let allowCreate = userData.id === this.tempId;
                if (allowCreate === false) {
                    // allow the creation
                    const tid = this.db.getAccountbyId(userData.id);
                    if (tid) {
                        allowCreate = true;
                    }
                }
                if (allowCreate) {
                    this.logger.debug(`Creating account for ${userData.username}`);
                    const hashpwd = await bcrypt.hash(userData.password, 10);
                    const acnt = await this.db.addAccount(userData.username, hashpwd);
                    const tokenData = this.createToken(acnt);
                    resp.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
                    resp.send({
                        status: 0,
                        message: { id: acnt.id, createdDate: acnt.createdDate, username: acnt.username },
                    });
                } else {
                    next(new HttpException(404, "Not allowed to create account"));
                }
            }
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
            id: user.id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, Environment.jwtSecret, { expiresIn }),
        };
    }
}
