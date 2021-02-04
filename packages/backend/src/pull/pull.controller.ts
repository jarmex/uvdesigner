import { Router, Request, Response, NextFunction } from "express";
import { IConnectorData, IController, IResponseData, USSDException } from "@uvdesigner/common";
import { Constants, getRequestType, ISubMessage, RequestType, setCustomHeader } from "../utils/constants";
import { getLogger, Logger } from "../utils";
import { AsyncRedis } from "../shared/AsyncRedis";
import Environment from "../shared/environment";
import { RVDController, SessionState } from "../shared/RVDController";

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

    pullrequest = async (req: Request, resp: Response, next: NextFunction) => {
        console.log(req.body);
        const { isAsync, ...connectorData } = req.body as IConnectorData;
        if (isAsync) {
            let stringifyData = "";
            // extract base information based on the connector
            const { requestType, connector, ...otherparams } = connectorData;
            if (connector.toLowerCase() === "mtn") {
                // extract the MTN information here and added it to the body
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
                    next(new USSDException("Unsupported request received. Try again"));
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
            // check if the request to abort
            if (connectorData.isabort) {
                resp.status(201).send({ abort: true });
            } else {
                // process request using synchronous approach
                const rvd = new RVDController();
                const rvdResponse = await rvd.entryPoint({
                    sessionState: SessionState.Continue,
                    ...connectorData,
                });
                const response: IResponseData = {
                    isContinue: rvdResponse.continue,
                    message: rvdResponse.message,
                    ...connectorData,
                };
                resp.status(200).send(response);
            }
        }
    };
}
