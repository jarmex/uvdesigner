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
        try {
            this.log.info(JSON.stringify(req.body));
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
                        this.log.error("Unsupported request received");
                        next(new USSDException("Unsupported request received. Try again"));
                    }
                }
                if (stringifyData !== "") {
                    setTimeout(() => {
                        this.log.info(`Connector: ${connector}, Data = ${stringifyData}`);
                        this.publish.publish(Constants.RedPublishKey, stringifyData);
                    }, 1);
                } else {
                    this.log.warn("Unable to process message since stringifyData is empty");
                }

                resp.set(setCustomHeader);
                resp.status(204).end();
            } else {
                // check if the request to abort
                if (connectorData.isabort) {
                    this.log.warn("ABORT: Disconnecting as requested by the connector.");
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
                    this.log.info(response);
                    resp.status(200).send(response);
                }
            }
        } catch (error) {
            this.log.error(error);
            next(new USSDException(error.message));
        }
    };
}
