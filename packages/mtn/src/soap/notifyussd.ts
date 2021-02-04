export const notifyUSSDReceptionRequest = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <soapenv:Header>
      <ns1:NotifySOAPHeader xmlns:ns1="http://www.huawei.com.cn/schema/common/v2_1">
         <ns1:spRevId>35000001</ns1:spRevId>
         <ns1:spRevpassword>206D88BB7F3D154B130DD6E1E0B8828B</ns1:spRevpassword>
         <ns1:spId>000201</ns1:spId>
         <ns1:serviceId>35000001000029</ns1:serviceId>
         <ns1:timeStamp>20100731064245</ns1:timeStamp>
         <ns1:linkid>12345678901111</ns1:linkid>
         <ns1:traceUniqueID>404092403801104031047140004003</ns1:traceUniqueID>
      </ns1:NotifySOAPHeader>
   </soapenv:Header>
   <soapenv:Body>
      <ns2:notifyUssdReception xmlns:ns2="http://www.csapi.org/schema/parlayx/ussd/notification/v1_0/local">
         <ns2:msgType>0</ns2:msgType>
         <ns2:senderCB>320207133</ns2:senderCB>
         <ns2:receiveCB>0xFFFFFFFF</ns2:receiveCB>
         <ns2:ussdOpType>1</ns2:ussdOpType>
         <ns2:msIsdn>8613699991234</ns2:msIsdn>
         <ns2:serviceCode>2929</ns2:serviceCode>
         <ns2:codeScheme>17</ns2:codeScheme>
         <ns2:ussdString>*10086*01#</ns2:ussdString>
         <ns2:extensionInfo>
            <item>
               <key />
               <value />
            </item>
         </ns2:extensionInfo>
      </ns2:notifyUssdReception>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export const notifyUSSDReceptionResponse = (result: string) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/wsdl/parlayx/ussd/notification/v1_0">
   <soapenv:Header />
   <soapenv:Body>
      <loc:notifyUssdReceptionResponse>
         <loc:result>${result}</loc:result>
      </loc:notifyUssdReceptionResponse>
   </soapenv:Body>
</soapenv:Envelope>`;
};

export const notifyUSSDAbortResponse = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/wsdl/parlayx/ussd/notification/v1_0">
   <soapenv:Header />
   <soapenv:Body>
      <loc:notifyUssdAbortResponse />
   </soapenv:Body>
</soapenv:Envelope>`;
};
