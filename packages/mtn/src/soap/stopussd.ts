import { IStartUSSDSession } from "./startussd";

export const stopUssdNotifcationRequest = (req: IStartUSSDSession) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/schema/osg/ussd/notification_manager/v1_0/local">
   <soapenv:Header>
      <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com.cn/schema/common/v2_1">
         <tns:spId>${req.spId}</tns:spId>
         <tns:spPassword>${req.spPassword}</tns:spPassword>
         <tns:serviceId>${req.serviceId}</tns:serviceId>
         <tns:timeStamp>${req.timeStamp}</tns:timeStamp>
      </tns:RequestSOAPHeader>
   </soapenv:Header>
   <soapenv:Body>
      <loc:stopUSSDNotification>
         <loc:correlator>${req.correlator}</loc:correlator>
      </loc:stopUSSDNotification>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export const stopUssdNotifcationResponse = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <soapenv:Body>
      <ns1:stopUSSDNotificationResponse xmlns:ns1="http://www.csapi.org/schema/osg/ussd/notification_manager/v1_0/local" />
   </soapenv:Body>
</soapenv:Envelope>`;
};
