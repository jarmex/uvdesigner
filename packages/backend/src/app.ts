import * as express from "express";
import { IController } from "@uvdesigner/common";
import { json } from "body-parser";
import errorMiddleware from "./middleware/error.middleware";
import * as cookieParser from "cookie-parser";
import { conLogger, getLogger } from "./utils";
import { Logger } from "log4js";
import * as cors from "cors";
import "reflect-metadata";
import RedisSubscribe from "./services/redis.subscribe";
import Environment from "./shared/environment";
//import { join } from "path";

class App {
    public app: express.Application;
    public port: number;
    private logger: Logger;
    private isDevMode: boolean;

    constructor(controllers: IController[], port: number) {
        this.app = express();
        this.port = port;
        this.logger = getLogger("app");
        this.isDevMode = this.app.get("env") === "development";
        this.initialMiddleWare();
        this.initialController(controllers);
        this.initializeErrorHandling();
        this.initialLogger();
        this.initializeRedisDatabase();
        //this.initialPublicDirectory();
    }
    //private initialPublicDirectory() {
    //    this.app.use(express.static(join(__dirname, "public")));
    //}

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }
    private initialMiddleWare() {
        this.app.use(json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(
            cors({
                origin: Environment.corsOrigin,
                credentials: true,
            })
        );
    }
    private initialLogger() {
        if (this.isDevMode) {
            this.app.use(conLogger("auto"));
        } else {
            this.app.use(conLogger("info"));
        }
    }

    private initialController(controllers: IController[]) {
        controllers.forEach(controller => {
            this.app.use("/api", controller.router);
        });
        // route all to the html page
        //this.app.use("*", (req: express.Request, res: express.Response) => {
        //    res.sendFile(join(__dirname, "public", "index.html"));
        //});
    }
    private initializeRedisDatabase() {
        new RedisSubscribe();
    }
    public listen() {
        this.app.listen(this.port, () => {
            this.logger.info(`UVD Listening on port ${this.port}`);
        });
    }
}

export default App;
