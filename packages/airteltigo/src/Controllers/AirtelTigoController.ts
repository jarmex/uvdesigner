import { Router, Request, Response, NextFunction } from "express";
import { raw } from "body-parser";
import { xml2js, js2xml } from "xml-js";
import {
  IConnectorData,
  IController,
  IResponseData,
  UssdService,
} from "@uvdesigner/common";
import {
  DataSet,
  DataSetResponse,
  IAirtelTigoUSSDRequest,
  IAirtelTigoUSSDResponse,
  Param,
  USSDDynMenuRequest,
  USSDDynMenuResponse,
} from "../types";
import HttpException from "../Exceptions/HttpException";
import AirtelTigoConfig from "../Config/AirtelTigoConfig";

class AirtelTigoController implements IController {
  public router: Router = Router();
  private path: string = "/tigo";

  constructor() {}
  public initRoutes() {
    // all route to use the raw and not converted to json
    const rawBodyParser = raw({
      type: function () {
        return true;
      },
      limit: "1mb",
    });
    this.router.post(this.path, rawBodyParser, this.handleRequest);
  }

  /**
   * handle the Airtel Tigo USSD xml request
   *
   * @param {Request} req - The express request object
   * @param {Response} resp - The express Response object
   * @param {NextFunction} next
   */
  handleRequest = async (req: Request, resp: Response, next: NextFunction) => {
    const xmlBody = req.body.toString();
    const ussdRequest = this.convertTo(xmlBody);
    // make a request to the ussd server
    if (ussdRequest === null) {
      next(new HttpException(401, "Invalid data received"));
    } else {
      // send request to the USSD Server
      try {
        const ussdServer = new UssdService();
        const data: IConnectorData = {
          connector: "AirtelTigo",
          isAsync: false,
          ussdServerUrl: AirtelTigoConfig.ussdServerUrl,
          responseUrl: "", // this is not required since sync is used here
          sessionId: ussdRequest.USSDDynMenuRequest.sessionId,
          msisdn: ussdRequest.USSDDynMenuRequest.msisdn,
          input: ussdRequest.USSDDynMenuRequest.userData,
        };
        const result = await ussdServer.request(data);
        // process the response from the ussd server
        const ussdResponse = this.processUSSDServerResponse(
          ussdRequest.USSDDynMenuRequest,
          result
        );
        resp.send(ussdResponse);
      } catch (error) {
        // process response for error
        resp.send("Failed");
      }
    }
  };

  private processUSSDServerResponse(
    req: USSDDynMenuRequest,
    response: IResponseData
  ): string {
    const dataSet: DataSetResponse = {
      param: {
        id: "1",
        value: response.message,
        rspFlag: "1",
        rspURL: AirtelTigoConfig.responseUrl,
        appendIndex: "0",
        default: "1",
      },
    };
    const ussdResp: USSDDynMenuResponse = {
      requestId: req.requestId,
      sessionId: req.sessionId,
      msisdn: req.msisdn,
      starCode: req.starCode,
      langId: AirtelTigoConfig.langId,
      encodingScheme: AirtelTigoConfig.encodingScheme,
      transferCode: "success",
      dataSet,
      ErrCode: "1",
      errURL: AirtelTigoConfig.responseUrl,
      timeStamp: req.timeStamp,
    };
    const fb: IAirtelTigoUSSDResponse = {
      USSDDynMenuResponse: ussdResp,
    };
    const options = { compact: true, ignoreComment: true, spaces: 4 };
    return js2xml(fb, options);
  }

  /**
   * convert from xml to object
   *
   * @param {string} xml
   * @returns {IAirtelTigoUSSDRequest | null}
   */
  private convertTo(xml: string): IAirtelTigoUSSDRequest | null {
    if (!xml) return null;
    const xmljs = xml2js(xml, {
      compact: true,
      ignoreDeclaration: true,
      ignoreDoctype: true,
    }) as any;
    const dataSet: DataSet = {
      param: new Array<Param>(),
    };
    const ussdDynMenuRequest: any = xmljs.USSDDynMenuRequest;
    if (!ussdDynMenuRequest) return null;
    if (
      ussdDynMenuRequest.dataSet &&
      ussdDynMenuRequest.dataSet.param &&
      Array.isArray(ussdDynMenuRequest.dataSet.param)
    ) {
      ussdDynMenuRequest.dataSet.param.forEach((dset: any) => {
        dataSet.param.push({
          id: dset.id._text,
          value: dset.value._test,
        });
      });
    }
    const result: IAirtelTigoUSSDRequest = {
      USSDDynMenuRequest: {
        keyWord: ussdDynMenuRequest.keyWord._text,
        sessionId: ussdDynMenuRequest.sessionId._text,
        msisdn: ussdDynMenuRequest.msisdn._text,
        requestId: ussdDynMenuRequest.requestId._text,
        starCode: ussdDynMenuRequest.starCode._text,
        timeStamp: ussdDynMenuRequest.timeStamp._text,
        userData: ussdDynMenuRequest.userData._text,
        dataSet,
      },
    };
    return result;
  }
}

export default AirtelTigoController;
