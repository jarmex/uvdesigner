import RVDNode from "./RVDNode";
import { getLogger, conLogger } from "../utils/logger";
import { IGenericObj, RVDResponse } from "./types";
import { AsyncRedis } from "../shared/AsyncRedis";
import Environment from "./environment";
import { ShortCodeDb } from "../db";

const redis = new AsyncRedis({ prefix: "paic:", ...Environment.redis });

const logger = getLogger("RVDController");

export enum SessionState {
    Begin = 0,
    Continue = 1,
    End = 3,
}
export interface IRVDSession {
    sessionId: string;
    msisdn: string;
    input: string;
    imsi?: string;
    cellid?: string;
    ussdString?: string;
    sessionState: SessionState;
    // additional data to be stored
    [key: string]: any;
}

export type EntryPointFunc = (request: IRVDSession) => Promise<RVDResponse>;

export class RVDController {
    sessionTimeout: number;
    rvdjson: IGenericObj;
    defaultErrorMsg: string;
    defaultWorkSpace?: string;

    constructor() {
        this.sessionTimeout = Environment.sessionTimeout || 40;
        this.rvdjson = {};
        this.defaultWorkSpace = Environment.defaultWorkSpace;
        this.defaultErrorMsg = Environment.defaultErrorMsg || "Error processing request";
    }

    /**
     * Read the current subscriber session from the database.
     * If the session doesn't exist return null
     * @param {String} sessionid The USSD GW sessionID
     * @param {String} msisdn The subscriber number
     * @memberof USSDFlowController
     */
    getSessionData = async (request: IRVDSession): Promise<any | null> => {
        try {
            const { msisdn, sessionId, input, shortcode, serviceId } = request;
            const _sessdionId = sessionId || msisdn;
            // check if the subscriber key exist
            const sessionsubdata = await redis.getAsync(_sessdionId);
            if (sessionsubdata) {
                return JSON.parse(sessionsubdata);
            }

            // return the default session variables
            // create a new session for this user
            const _serviceId = await this.getSid(shortcode || serviceId || input);
            if (!_serviceId) {
                logger.warn(`ServiceId information not found for shortcode = ${shortcode || serviceId || input}`);
                return null;
            }
            const state: IGenericObj = {
                $core_From: msisdn,
                $cell_id: request.cellid || "",
                $core_CellId: request.cellid || "",
                $session_id: sessionId,
                $imsi: request.imsi || "",
                $core_Imsi: request.imsi || "",
                $core_Body: input,
                $cellid: request.cellid || "",
                $serviceId: _serviceId,
                $core_To: shortcode || serviceId || input,
                $shortcode: shortcode || serviceId || input,
                $core_AccountSid: _serviceId,
            };
            // check if there is lac, mcc, mnc etc
            if (request.lac && request.mcc) {
                state.$cellid = `${request.mcc}${request.mnc}${request.lac}${request.cellid}`;
                state.$core_CellId = `${request.mcc}${request.mnc}${request.lac}${request.cellid}`;
            }
            return state;
        } catch (error) {
            logger.error(error.message);
        }
        return null;
    };

    saveSessionData = async (sessionid: string, data = {}) => {
        try {
            await redis.setExAsync(sessionid, this.sessionTimeout, JSON.stringify(data));
        } catch (error) {
            logger.error(error.message);
        }
    };

    clearSessionData = async (sessionid: string) => {
        if (sessionid) {
            try {
                await redis.delAsync(sessionid);
            } catch (error) {
                // do nothing with the exception.
            }
        }
    };

    getSid = async (ussdInput: string) => {
        try {
            const sh = new ShortCodeDb();
            await sh.readAllShortcodes();
            const allsh = await sh.getAllShortCodes();
            if (allsh) {
                const newsid = allsh.find(h => h.mapKey === ussdInput);
                if (newsid) {
                    return newsid.serviceId;
                }
            }
        } catch (error) {
            logger.error(error.message);
        }
        return undefined;
    };

    // this is where the logic for the new implementation should happen
    entryPoint: EntryPointFunc = async (request: IRVDSession) => {
        try {
            const { msisdn, sessionId, input } = request;

            const newSessionId = sessionId || msisdn;
            // get the session. if the session does not exist then process the first stage of rvd
            const state = await this.getSessionData(request);
            // if we are unable to get the session data
            if (state === null) {
                return {
                    continue: false,
                    message: this.defaultErrorMsg,
                };
            }
            const rvdController = new RVDNode(state);
            // read the first data
            await rvdController.readRvdData();

            const response = await rvdController.processInput(input);

            const isContinue = response.next ? true : false;
            // check if storing session is needed
            if (response.data && isContinue) {
                await this.saveSessionData(newSessionId, response.data);
            } else {
                // no session information is required. Need to clear previous session
                await this.clearSessionData(newSessionId);
            }
            let reply = response.message;
            if (!reply) {
                logger.info(`No reply message found for ${msisdn}.`);
                reply = this.defaultErrorMsg;
            }

            return {
                continue: isContinue,
                message: reply,
            };
        } catch (error) {
            logger.error(error.message);
            return {
                continue: false,
                message: this.defaultErrorMsg,
            };
        }
    };
}

export { getLogger, conLogger };
export { default as ensureArray } from "./ensureArray";
export * from "./types";
