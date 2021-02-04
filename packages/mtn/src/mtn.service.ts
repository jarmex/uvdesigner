import axios from "axios";
import * as https from "https";
import { getLogger } from "@uvdesigner/common";
import { xml2json } from "xml-js";
import { JSONPath } from "jsonpath-plus";
import { MtnSettings } from "./settings";

const logger = getLogger("MtnService");

export enum RetValueStatus {
  Failed = 0,
  Success = 1,
  Others = 2,
}

export interface IGenericObj {
  [key: string]: any;
}

export interface IRetValue extends IGenericObj {
  status: RetValueStatus;
  faultcode: string;
  faultstring: string;
}

export class MtnService {
  async sendRequest(
    url: string,
    xmlBody: string,
    soapAction?: string
  ): Promise<IRetValue | null> {
    const headers: any = {
      "Content-Type": "text/xml;charset=UTF-8",
      "cache-control": "no-cache",
    };
    if (soapAction) {
      headers["SOAPAction"] = soapAction;
    } else {
      headers.SOAPAction = "";
    }
    logger.info(xmlBody);

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    try {
      const response = await axios({
        headers,
        method: "POST",
        baseURL: MtnSettings.baseUrl,
        url,
        timeout: MtnSettings.timeOut,
        data: xmlBody,
        httpsAgent,
        responseType: "document",
      });

      logger.debug(
        `Status=${response.status} (${response.statusText}), Data: ${response.data}`
      );

      // response received. convert it to object and return it
      const proResponse = this.processResponse(response.data);
      if (proResponse.status === RetValueStatus.Failed) {
        logger.error(proResponse);
      }
      return proResponse;
    } catch (err) {
      if (err.response && err.response.status) {
        // error contains response from axios call
        logger.error(
          `RAW DATA: Status: ${err.response.status}(${err.response.statusText}), DATA: ${err.response.data} `
        );
        // log the process data
        const l = this.processResponse(err.response.data);
        logger.error(l);
        return l;
      } else {
        logger.error(err.message);
      }
    }
    return null;
  }

  processResponse(resp: string): IRetValue {
    try {
      const result = xml2json(resp, {
        compact: true,
        ignoreDeclaration: true,
        elementNameFn: function (name) {
          return name.slice(name.search(":") + 1);
        },
        ignoreComment: true,
        ignoreAttributes: true,
      });
      // check if there is fault
      const faultcode = JSONPath({
        path: "$..faultcode.*",
        json: JSON.parse(result),
      });
      if (Array.isArray(faultcode) && faultcode.length > 0) {
        const faultstring = JSONPath({
          path: "$..faultstring.*",
          json: JSON.parse(result),
        });
        return {
          status: RetValueStatus.Failed,
          faultcode: faultcode[0],
          faultstring: faultstring[0],
        };
      }
      return {
        status: RetValueStatus.Success,
        faultcode: "",
        faultstring: "",
      };
    } catch (error) {
      logger.error(error.message);
      return {
        status: RetValueStatus.Others,
        faultcode: "",
        faultstring: error.message,
      };
    }
  }
}
