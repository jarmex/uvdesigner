export const Constants = {
    RedPublishKey: "red:publish:key",
};
export const setCustomHeader = {
    "Connection": "close",
    "Server": "USSD",
    "Content-type": "application/json",
};
export enum RequestType {
    MTN_notifyUssdReception = 0,
    MTN_notifyUSSDAbort = 1,
    Others = 2,
}

export interface ISubMessage {
    requestType: RequestType;
    connector: Provider;
    [key: string]: any;
}

export type Provider = "MTN" | "AirtelTigo" | "Vodafone" | "Glo";

export const getRequestType = (connector: Provider, rqType: any): RequestType => {
    if (rqType === undefined) return RequestType.Others;
    const numRq = parseInt(rqType);
    if (isNaN(numRq)) return RequestType.Others;

    if (connector === "MTN") {
        switch (numRq) {
            case 0:
                return RequestType.MTN_notifyUssdReception;
            case 1:
                return RequestType.MTN_notifyUSSDAbort;
            default:
                return RequestType.Others;
        }
    }
    return RequestType.Others;
};
