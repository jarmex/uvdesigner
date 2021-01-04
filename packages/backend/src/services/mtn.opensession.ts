import { ISubMessage } from "../utils/constants";
import { getLogger, Logger } from "../utils";
import { RVDController, IRVDSession, SessionState } from "../shared/RVDController";
import { axiosRequest } from "./axios.request";
import Environment from "../shared/environment";

class MTNOpenSession {
    private log: Logger;
    constructor() {
        this.log = getLogger("mtn");
    }

    onOpenUssdSession = async (request: ISubMessage) => {
        try {
            const { senderCB: sessionId, msIsdn: msisdn, ussdString: input, ...rest } = request;
            const params = <IRVDSession>{
                sessionId: sessionId as string,
                msisdn: msisdn as string,
                input: input as string,
                ussdString: input as string,
                ...rest,
                sessionState: SessionState.Begin,
            };
            const extendedSdp = new RVDController();
            const response = await extendedSdp.entryPoint(params);
            const reply = response.continue
                ? {
                      msgType: 1,
                      ussdOpType: 1,
                      ussdString: response.message,
                      receiveCB: sessionId,
                  }
                : {
                      msgType: 2,
                      ussdOpType: 2,
                      ussdString: response.message,
                      receiveCB: sessionId,
                  };
            const dataToSend = Object.assign({}, request, reply);

            this.log.debug(`Data to send => ${JSON.stringify(dataToSend)}`);

            const { status, statusText } = await axiosRequest(dataToSend, Environment.connector.MTN);

            this.log.info(`MTN Connector API Response => Status = ${status} (${statusText})`);
        } catch (error) {
            this.log.error(error.message);
        }
    };

    // send a response back
    onSendRequest = async (request: ISubMessage) => {
        try {
            const { senderCB: sessionId, msIsdn: msisdn, ussdString: input, ...rest } = request;
            const params = <IRVDSession>{
                sessionId: sessionId as string,
                msisdn: msisdn as string,
                input: input as string,
                ussdString: input as string,
                ...rest,
                sessionState: SessionState.Continue,
            };
            const extendedSdp = new RVDController();
            const response = await extendedSdp.entryPoint(params);
            const reply = response.continue
                ? {
                      msgType: 1,
                      ussdOpType: 1,
                      ussdString: response.message,
                      receiveCB: sessionId,
                  }
                : {
                      msgType: 2,
                      ussdOpType: 2,
                      ussdString: response.message,
                      receiveCB: sessionId,
                  };
            const dataToSend = Object.assign({}, request, reply);
            const { status, statusText } = await axiosRequest(dataToSend, Environment.connector.MTN);
            this.log.info(`MTN Connector API Response => Status = ${status} (${statusText})`);
        } catch (error) {
            this.log.error("Send data from <sendRequest> failed. Reason = " + error.message);
        }
    };
    onCloseSession = async (request: ISubMessage) => {
        this.log.info(request);
        if (request.connector === "MTN") {
            const { senderCB: sessionId } = request;
            const extendedSdp = new RVDController();
            await extendedSdp.clearSessionData(sessionId);
        }
    };
}

export default MTNOpenSession;
