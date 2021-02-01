/*
 * The request interface for Airtel Tigo USSD Stateful dynamic menu
 */
export interface IAirtelTigoUSSDRequest {
  USSDDynMenuRequest: USSDDynMenuRequest;
}

export interface USSDDynMenuRequest {
  requestId: string;
  sessionId: string;
  msisdn: string;
  starCode: string;
  keyWord: string;
  dataSet: DataSet;
  userData: string;
  timeStamp: string;
}

export interface DataSet {
  param: Param[];
}

export interface Param {
  id: string;
  value: string;
}

// The response XML Structure
export interface IAirtelTigoUSSDResponse {
  USSDDynMenuResponse: USSDDynMenuResponse;
}

export interface USSDDynMenuResponse {
  requestId: string;
  sessionId: string;
  msisdn: string;
  starCode: string;
  langId: string;
  encodingScheme: string;
  transferCode: string;
  dataSet: DataSetResponse;
  ErrCode: string;
  errURL: string;
  timeStamp: string;
}

export interface DataSetResponse {
  param: ParamResponse;
}

export interface ParamResponse {
  id: string;
  value: string;
  rspFlag: string;
  rspURL: string;
  appendIndex: string;
  default: string;
}
