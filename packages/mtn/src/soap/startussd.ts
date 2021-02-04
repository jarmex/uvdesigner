export interface IStartUSSDSession {
  spId: string;
  spPassword: string;
  serviceId: string;
  endpoint: string;
  serviceActionNumber: string;
  correlator: string;
  timeStamp: string;
}
export const startUssdSessionRequest = (req: IStartUSSDSession) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/wsdl/osg/ussd/notification_manager/v1_0/local">
   <soapenv:Header>
      <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com.cn/schema/common/v2_1">
         <tns:spId>${req.spId}</tns:spId>
         <tns:spPassword>${req.spPassword}</tns:spPassword>
         <tns:serviceId>${req.serviceId}</tns:serviceId>
         <tns:timeStamp>${req.timeStamp}</tns:timeStamp>
      </tns:RequestSOAPHeader>
   </soapenv:Header>
   <soapenv:Body>
      <loc:startUSSDNotification>
         <loc:reference>
            <endpoint>${req.endpoint}</endpoint>
            <interfaceName>notifyUssdReception</interfaceName>
            <correlator>${req.correlator}</correlator>
         </loc:reference>
         <loc:ussdServiceActivationNumber>${req.serviceActionNumber}</loc:ussdServiceActivationNumber>
      </loc:startUSSDNotification>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export const startUSSDNotificationResponse = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/ " xmlns:xsi="http://www.w3.org/2001/XMLSchemainstance">
   <soapenv:Body>
      <ns1:startUSSDNotificationResponse xmlns:ns1="http://www.csapi.org/schema/osg/ussd/notification_manager/v1_0/local" />
   </soapenv:Body>
</soapenv:Envelope>`;
};
