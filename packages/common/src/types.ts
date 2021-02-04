import { Router } from "express";

export interface IController {
  router: Router;
  initRoutes: () => void;
}

export interface IGenericObj {
  [key: string]: any;
}

export interface IConnectorData {
  ussdServerUrl: string;
  connector: Connector;
  isAsync: boolean;
  responseUrl: string;
  msisdn: string;
  sessionId: string;
  input: string;
  [key: string]: any;
}

/**
 * The response data from the USSD server. Each response from the USSD server will contain the
 * the connector, continue flag and the message with any additional information that was previous passed via the request
 */
export interface IResponseData {
  connector: string;
  isContinue: boolean;
  message: string;
  [key: string]: any;
}

export type Connector = "MTN" | "AirtelTigo" | "Glo" | "TruRoute" | "Vodafone";
