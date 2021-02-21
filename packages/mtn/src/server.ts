import { CommonApp, UssdService, getLogger } from "@uvdesigner/common";
import { MtnController } from "./mtn.controller";
import { MtnService, RetValueStatus } from "./mtn.service";
import { MtnSettings, ServiceUrl } from "./settings";
import { startUssdSessionRequest } from "./soap/startussd";
import { UssdServerController } from "./ussd.server.controller";

const port: number = 8081;
const app = new CommonApp(
  [new MtnController(), new UssdServerController()],
  port,
  "/api"
);

const logger = getLogger("mtn");

app.listen(`MTN application listening on ${port}`, async () => {
  logger.info(`MTN Connector application running on port ${port}`);
  // print all routes
  /*console.log(
    app.app._router.stack
      .filter((r: any) => r.route)
      .map((r: any) => r.route.path)
  );*/
  // get the configuration settings from USSD Server
  try {
    const ussdServer = new UssdService();
    const baseUrl =
      process.env.USSDSERVER_ENDPOINT || "http://ussdserver:8080/api";
    const settings = await ussdServer.getSetting(baseUrl, "MTN");
    // set the configuration variables
    if (settings) {
      logger.debug(
        `Using settings from USSD Server: ${JSON.stringify(settings)}`
      );
      MtnSettings.timeOut = settings.timeout;
      MtnSettings.baseUrl = settings.baseUrl;
      MtnSettings.spPassword = settings.spPassword;
      MtnSettings.timeStamp = settings.timeStamp;

      logger.debug(settings);
      if (settings.services && Array.isArray(settings.services)) {
        const allpromise = settings.services.map((item: any) => {
          const xmlBody = startUssdSessionRequest({
            correlator: item.correlator,
            spId: item.spId,
            serviceId: item.serviceId,
            spPassword: settings.spPassword,
            serviceActionNumber: item.activationNumber,
            timeStamp: settings.timeStamp,
            endpoint: settings.endpoint,
          });
          const response = new MtnService();
          return response.sendRequest(
            ServiceUrl.startUSSDNotification,
            xmlBody
          );
        });
        const allResponse = await Promise.all(allpromise);
        logger.info(MtnSettings);
        if (allResponse && allResponse.length > 0) {
          allResponse.forEach((resp: any) => {
            if (resp.status === RetValueStatus.Failed) {
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
    if (error.response && error.response.data) {
      logger.error(error.response.data);
    }
    logger.error(error.message);
  }
});
