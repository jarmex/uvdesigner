import { MtnSettings } from "../settings";
import { IStartUSSDSession } from "./startussd";

export enum MessageType {
  Begin = 0,
  Continue = 1,
  End = 2,
}

export enum UssdOperationType {
  Request = 1,
  Notify = 2,
  Response = 3,
  Release = 4,
}

export const getMsgType = (msgType: string): MessageType => {
  switch (parseInt(msgType)) {
    case 0:
      return MessageType.Begin;
    case 1:
      return MessageType.Continue;
    default:
      return MessageType.End;
  }
};

export interface ISendUSSD extends IStartUSSDSession {
  // Service order ID.
  linkid: string;
  // OA & FA
  OrigMSISDN: string;
  ServiceOrderId?: string;
  ServiceGiftId?: string;
  msgType: MessageType;
  // senderCB: Initiator session ID.
  senderCB: string;
  // Recipient session ID.
  receiveCB?: string;
  ussdOpType: UssdOperationType;
  // Mobile number or the fake ID of the message recipient.
  DestinationMSISDN: string;
  //Name of the message sender, which is displayed on the user terminal.
  serviceCode: string;
  //Coding mode of the ussdString value. (default: 68)
  codeScheme: string;
  //USSD message content received by the user.
  ussdString: string;
  //Notification address of an MO USSD message.
  optEndPoint?: string;
  //Service gift ID.
  presentId?: string;
}

export const sendUSSDRequest = (req: ISendUSSD) => {
  let addTag = "";
  if (req.linkid) {
    addTag = `<tns:linkid>${req.linkid}</tns:linkid>`;
  } else if (req.presentId) {
    addTag = `<tns:presentid>${req.presentId}</tns:presentid>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/wsdl/parlayx/ussd/send/v1_0">
   <soapenv:Header>
      <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com.cn/schema/common/v2_1">
         <tns:spId>${req.spId}</tns:spId>
         <tns:spPassword>${MtnSettings.spPassword}</tns:spPassword>
         <tns:serviceId>${req.serviceId}</tns:serviceId>
         <tns:timeStamp>${MtnSettings.timeStamp}</tns:timeStamp>
         <tns:OA>${req.OrigMSISDN}</tns:OA>
         <tns:FA>${req.OrigMSISDN}</tns:FA> 
         ${addTag}
      </tns:RequestSOAPHeader>
   </soapenv:Header>
   <soapenv:Body>
      <loc:sendUssd>
         <loc:msgType>${req.msgType.valueOf()}</loc:msgType>
         <loc:senderCB>${req.senderCB}</loc:senderCB>
         <loc:receiveCB>${req.receiveCB}</loc:receiveCB>
         <loc:ussdOpType>${req.ussdOpType.valueOf()}</loc:ussdOpType>
         <loc:msIsdn>${req.DestinationMSISDN}</loc:msIsdn>
         <loc:serviceCode>${req.serviceCode}</loc:serviceCode>
         <loc:codeScheme>${req.codeScheme}</loc:codeScheme>
         <loc:ussdString>${req.ussdString}</loc:ussdString>
      </loc:sendUssd>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export const sendUssdResponse = (result: string) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <soapenv:Body>
      <ns1:sendUssdResponse xmlns:ns1="http://www.csapi.org/wsdl/parlayx/ussd/send/v1_0">
         <ns1:result>${result}</ns1:result>
      </ns1:sendUssdResponse>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export interface ISendUssdAbort extends IStartUSSDSession {
  senderCB: string;
  receiveCB: string;
  abortReason: string;
  oa: string;
}

export const sendUssdAbortRequest = (req: ISendUssdAbort) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/wsdl/parlayx/ussd/send/v1_0">
   <soapenv:Header>
      <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com.cn/schema/common/v2_1">
         <tns:spId>${req.spId}</tns:spId>
         <tns:spPassword>${req.spPassword}</tns:spPassword>
         <tns:serviceId>${req.serviceId}</tns:serviceId>
         <tns:timeStamp>${req.timeStamp}</tns:timeStamp>
         <tns:OA>${req.oa}</tns:OA>
         <tns:FA>${req.oa}</tns:FA>
      </tns:RequestSOAPHeader>
   </soapenv:Header>
   <soapenv:Body>
      <loc:sendUssdAbort>
         <loc:senderCB>${req.senderCB}</loc:senderCB>
         <loc:receiveCB>${req.receiveCB}</loc:receiveCB>
         <loc:abortReason>${req.abortReason}</loc:abortReason>
      </loc:sendUssdAbort>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export const sendUssdAbortResponse = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/wsdl/parlayx/ussd/send/v1_0">
   <soapenv:Header />
   <soapenv:Body>
      <loc:sendUssdAbortResponse />
   </soapenv:Body>
</soapenv:Envelope>`;
};
