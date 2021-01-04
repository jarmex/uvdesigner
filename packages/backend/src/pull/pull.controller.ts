import USSDException from "../exception/USSDException";
import { Router, Request, Response, NextFunction } from "express";
import { IController } from "../types";
import { Constants, getRequestType, ISubMessage, RequestType, setCustomHeader } from "../utils/constants";
import { getLogger, Logger } from "../utils";
import { AsyncRedis } from "../shared/AsyncRedis";
import Environment from "../shared/environment";

export class UssdPullController implements IController {
    public path: string = "/ussd";
    public router: Router = Router();
    private log: Logger;
    private publish: AsyncRedis;
    constructor() {
        this.initRoutes();
        this.log = getLogger("ussd");
        this.initializeRedisDatabase();
    }
    private initializeRedisDatabase() {
        this.publish = new AsyncRedis({
            ...Environment.redis,
        });
    }
    public initRoutes() {
        this.router.post(this.path, this.pullrequest);
    }

    pullrequest = (req: Request, resp: Response, next: NextFunction) => {
        console.log(req.body);
        const { connector, ...rest } = req.body;
        if (connector) {
            let stringifyData = "";
            // extract base information based on the connector
            if (connector.toLowerCase() === "mtn") {
                // extract the MTN information here and added it to the body
                const { requestType, ...otherparams } = rest;
                const _requestType = getRequestType("MTN", requestType);
                if (_requestType === RequestType.MTN_notifyUssdReception) {
                    // extract the data for the notifyUssdReception
                    stringifyData = JSON.stringify(<ISubMessage>{
                        connector: "MTN",
                        requestType: _requestType,
                        ...otherparams,
                    });
                } else if (_requestType === RequestType.MTN_notifyUSSDAbort) {
                    // extract the info for abort
                    stringifyData = JSON.stringify(<ISubMessage>{
                        connector: "MTN",
                        requestType: _requestType,
                        ...otherparams,
                    });
                } else {
                    // unknown situation. Figure out what to do here
                }
            }
            if (stringifyData !== "") {
                setTimeout(() => {
                    this.log.info(`Connector: ${connector}, Data = ${stringifyData}`);
                    this.publish.publish(Constants.RedPublishKey, stringifyData);
                }, 1);
            }

            resp.set(setCustomHeader);
            resp.status(204).end();
        } else {
            next(new USSDException("No connector found"));
        }
    };
}
