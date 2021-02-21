import { getLogger, IController } from "@uvdesigner/common";
import { Router, Request, Response } from "express";
import * as BodyParser from "body-parser";
import { getMsgType, sendUSSDRequest } from "./soap/sendussd";
import { MtnService, RetValueStatus } from "./mtn.service";
import { ServiceUrl } from "./settings";
import { stopUssdNotifcationRequest } from "./soap/stopussd";

export class UssdServerController implements IController {
  public router: Router = Router();
  private notifypath: string = "/notify";
  private stoppath: string = "/stopNotification";
  private logger = getLogger("ussdserver");
  constructor() {
    this.initRoutes();
  }
  public initRoutes() {
    this.router.use(BodyParser.json());
    this.router.post(this.notifypath, this.ussdServerNotify);
    this.router.post(this.stoppath, this.stopNotification);
  }

  ussdServerNotify = async (req: Request, res: Response) => {
    // all request from the USSD Server will be POST
    const request = req.body as any;
    this.logger.debug(JSON.stringify(request));
    // ensure that all request contains the msgType. The message type indicate either to continue the
    // ussd session or abort
    if (!request.msgType) {
      this.logger.error("The message type was not found. Discarding message");
      res.status(401).send({
        status: "failed",
        message: "Message not in the correct format",
      });
      return;
    }
    // process the request
    // TODO when messageType is = 0 => represent PUSH will be supportted later
    const msgType = getMsgType(request.msgType);
    const sendreq: any = {
      endpoint: request.endPoint,
      OrigMSISDN: request.msIsdn,
      codeScheme: request.codeScheme,
      ussdOpType: request.ussdOpType, // TODO from USSDServer
      msgType,
      DestinationMSISDN: request.msIsdn,
      ...request,
    };
    if (request.receiveCB === "FFFFFFFF" || !sendreq.receiveCB) {
      sendreq.receiveCB = request.senderCB;
    }
    const xmlReq = sendUSSDRequest(sendreq);
    const mtnserivce = new MtnService();
    const mtnresponse = await mtnserivce.sendRequest(
      ServiceUrl.sendUSSD,
      xmlReq
    );
    if (mtnresponse?.status === RetValueStatus.Failed) {
      this.logger.error(
        `Sending request failed. ${JSON.stringify(mtnresponse)}`
      );
    } else {
      this.logger.info(
        `Sending request succeeded. Result = ${mtnresponse?.status.toString()}`
      );
    }

    // send feedback to USSDServer
    res.status(201).send({
      status: "success",
      message: "Message received successfully",
    });
  };
  stopNotification = async (req: Request, res: Response): Promise<void> => {
    if (req.body.stop !== "bf993eea-342f-11eb-adc1-0242ac120002") {
      res.status(403).send({ message: "Unsupported operation" });
      return;
    }
    try {
      const result = req.body as any;
      const request: any = {
        spId: result.spId,
        serviceId: result.spServiceId,
        spPassword: result.spPassword,
        serviceActionNumber: result.ussdServiceActivationNumber,
        endpoint: result.endPoint,
        correlator: result.correlator,
        timeStamp: result.timeStamp,
      };
      const xmlStop = stopUssdNotifcationRequest(request);
      const mtnserivce = new MtnService();
      const resp = await mtnserivce.sendRequest(
        ServiceUrl.stopUSSDNotification,
        xmlStop
      );
      this.logger.info(`Response for closing notifications = ${resp}`);
    } catch (e) {
      this.logger.error(e.message);
    }
    res.status(204).send({ message: "Done" });
  };
}
