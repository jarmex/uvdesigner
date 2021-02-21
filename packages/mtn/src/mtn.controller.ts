import {
  IController,
  getLogger,
  IGenericObj,
  UssdService,
  IConnectorData,
} from "@uvdesigner/common";
import { Router, Request, Response } from "express";
import * as BodyParser from "body-parser";
import { getMsgType, MessageType } from "./soap/sendussd";
import {
  notifyUSSDAbortResponse,
  notifyUSSDReceptionResponse,
} from "./soap/notifyussd";
import { xml2json } from "xml-js";
import { JSONPath } from "jsonpath-plus";
import { MtnSettings } from "./settings";

enum RequestType {
  notifyUssdReception = 0,
  notifyUSSDAbort = 1,
  Others = 2,
}

interface IRequest extends IGenericObj {
  requestType: RequestType;
  xmlResponse: string;
  msgType: MessageType;
}

export class MtnController implements IController {
  public router: Router = Router();
  private path: string = "/service/notify";
  private logger = getLogger("controller");
  constructor() {
    this.initRoutes();
  }
  public initRoutes() {
    const rawParser = BodyParser.raw({
      type: function () {
        return true;
      },
      limit: "1mb",
    });
    this.router.post(this.path, rawParser, this.notifyService);
  }

  notifyService = async (req: Request, res: Response) => {
    const { xmlResponse, ...result } = this.extractData(req.body.toString());
    this.logger.debug(JSON.stringify(result));
    // send the request to the USSD Server for processing.
    if (result.requestType !== RequestType.Others) {
      const ussdService = new UssdService();

      const dataToSend: IConnectorData = {
        msisdn: result.msisdn,
        isAsync: true,
        sessionId: result.sessionId,
        responseUrl: process.env.MTN_CONNECTOR || "",
        ussdServerUrl: process.env.USSDSERVER_ENDPOINT || "",
        connector: "MTN",
        input: result.ussdString,
        ...result,
      };
      this.logger.debug(JSON.stringify(dataToSend));
      const sendResp = await ussdService.request(dataToSend);
      if (sendResp != null) {
        this.logger.info(sendResp);
      }
    } else {
      this.logger.warn("Request not sent to the USSD Server");
    }

    this.logger.info(`Response: ${xmlResponse}`);
    // send a response back to MTN
    res.status(200);
    res.type("application/xml");
    res.send(xmlResponse);
  };

  private extractData(xmlBody: string): IRequest {
    try {
      this.logger.info(`Received: ${xmlBody}`);
      let result = xml2json(xmlBody, {
        compact: true,
        ignoreDeclaration: true,
        elementNameFn: function (name: any) {
          return name.slice(name.search(":") + 1);
        },
        ignoreComment: true,
        ignoreAttributes: true,
      });
      const jdata = JSON.parse(result);
      // extract header information
      const header = JSONPath({ path: "$..NotifySOAPHeader", json: jdata });
      const headerInfo: any = {
        spPassword: MtnSettings.spPassword,
      };

      if (Array.isArray(header)) {
        header.forEach((hd: any) => {
          Object.keys(hd).forEach((key) => {
            headerInfo[key] = hd[key]._text;
          });
        });
      }
      // check if the request is ussdReceiption or ussdAbort
      const notify = JSONPath({
        path: "$..notifyUssdReception",
        json: jdata,
      });

      if (Array.isArray(notify) && notify.length > 0) {
        const notdata = notify[0];
        // process the ussdReceiptionRequest
        const inputData = this.extractShortCode(notdata.ussdString._text);
        return {
          ...headerInfo,
          requestType: RequestType.notifyUssdReception,
          senderCB: notdata.senderCB._text,
          receiveCB: notdata.receiveCB._text,
          msIsdn: notdata.msIsdn._text,
          serviceCode: notdata.serviceCode._text,
          ussdString: notdata.ussdString._text,
          codeScheme: notdata.codeScheme._text,
          ussdOpType: notdata.ussdOpType._text,
          xmlResponse: notifyUSSDReceptionResponse("0"),
          msgType: getMsgType(notdata.msgType._text),
          ...inputData,
        };
      }
      const ussdAbort = JSONPath({
        path: "$..notifyUssdAbort",
        json: JSON.parse(result),
      });
      if (Array.isArray(ussdAbort) && ussdAbort.length > 0) {
        const abortData = ussdAbort[0];

        return {
          requestType: RequestType.notifyUSSDAbort,
          senderCB: abortData.senderCB._text,
          receiveCB: abortData.receiveCB._text,
          abortReason: abortData.abortReason._text,
          xmlResponse: notifyUSSDAbortResponse(),
          msgType: MessageType.End,
        };
      }
    } catch (err) {
      this.logger.error(err.message);
    }
    return {
      requestType: RequestType.Others,
      xmlResponse: notifyUSSDReceptionResponse("1"),
      msgType: MessageType.End,
    };
  }

  private extractShortCode(ussdstring: string): IGenericObj {
    if (!ussdstring || ussdstring.length === 0) {
      return {
        input: ussdstring,
      };
    }
    const splitStr = ussdstring.split("#");
    if (splitStr.length === 9) {
      return {
        shortcode: splitStr[0].replace(/\*/g, ""), //TODO check if there is more than one * in the shortcode
        imsi: splitStr[1],
        sender: splitStr[2],
        vlr: splitStr[3],
        mcc: splitStr[4],
        mnc: splitStr[5],
        lac: splitStr[6],
        cellid: splitStr[7],
      };
    }
    return {
      input: ussdstring,
    };
  }
}
