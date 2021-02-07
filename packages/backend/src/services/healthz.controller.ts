import { IController } from "@uvdesigner/common";
import { Router, Request, Response } from "express";

export class HealthzController implements IController {
    router: Router;
    private path: string = "/healthz";
    constructor() {
        this.router = Router();
        this.initRoutes();
    }
    public initRoutes() {
        this.router.get(this.path, this.handleHealtz);
    }
    handleHealtz = (_: Request, res: Response) => {
        res.send({ message: "success" });
    };
}
