import { CommonApp, UssdService, getLogger } from "@uvdesigner/common";
import { MtnService, RetValueStatus } from "./mtn.service";
import { MtnSettings, ServiceUrl } from "./settings";
import { startUssdSessionRequest } from "./soap/startussd";

const app = new CommonApp([], 8080, "api");

const logger = getLogger("mtn");

app.listen("MTN application listening on 8080", async () => {
  // get the configuration settings from USSD Server
  try {
    const ussdServer = new UssdService();
    const baseUrl =
      process.env.USSDSERVER_ENDPOINT || "http://localhost:8080/api";
    const settings = await ussdServer.getSetting(baseUrl, "MTN");
    // set the configuration variables
    if (settings) {
      MtnSettings.timeOut = settings.timeout;
      MtnSettings.baseUrl = settings.baseUrl;

      if (settings.ussd && Array.isArray(settings.ussd)) {
        const allpromise = settings.ussd.map((item: any) => {
          const xmlBody = startUssdSessionRequest({
            correlator: item.correlator,
            spId: item.spId,
            serviceId: item.serviceId,
            spPassword: item.spPassword,
            serviceActionNumber: item.serviceActionNumber,
            timeStamp: item.timeStamp,
            endpoint: item.endpoint,
          });
          const response = new MtnService();
          return response.sendRequest(
            ServiceUrl.startUSSDNotification,
            xmlBody
          );
        });
        const allResponse = await Promise.all(allpromise);
        if (allResponse && allResponse.length > 0) {
          allResponse.forEach((resp) => {
            if (resp?.status === RetValueStatus.Failed) {
              if (resp.faultcode === "SVC0005") {
                logger.info("Notification already sent. ");
              } else {
                logger.error(
                  `FaultCode = ${resp.faultcode} (${resp.faultstring}) `
                );
              }
            } else {
              logger.info(
                `Response for startUssdSessionRequest = ${resp?.status}`
              );
            }
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});
