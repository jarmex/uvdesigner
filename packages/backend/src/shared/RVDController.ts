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
    getSessionData = async (sessionid: string) => {
        try {
            // check if the subscriber key exist
            const sessionsubdata = await redis.getAsync(sessionid);
            if (sessionsubdata) {
                return JSON.parse(sessionsubdata);
            }
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
        const saveShortCode = `sh${ussdInput}`.replace(/#/g, "").replace(/\*/g, "");
        try {
            const sid = (await redis.getAsync(saveShortCode)) as string;
            if (!sid) {
                const sh = new ShortCodeDb();
                const allsh = await sh.getAllShortCodes();
                if (allsh) {
                    const newsid = allsh.find(h => h.mapKey === ussdInput);
                    if (newsid) {
                        await redis.setAsync(saveShortCode, newsid.serviceId);
                        return newsid.serviceId;
                    }
                }
            } else {
                return sid;
            }
        } catch (error) {
            logger.error(error.message);
        }
        return undefined;
    };

    // this is where the logic for the new implementation should happen
    entryPoint: EntryPointFunc = async (request: IRVDSession) => {
        try {
            const { msisdn, sessionId, input, ussdString, shortcode, senderCB } = request;

            const newSessionId = sessionId || senderCB || msisdn;
            // get the session. if the session does not exist then process the first stage of rvd
            const subSession = await this.getSessionData(newSessionId);
            // logger.info(`${JSON.stringify(request)} Session=${JSON.stringify(subSession)}`);
            // application state
            const state: IGenericObj = {
                $core_From: msisdn,
                $cell_id: request.cellid || "",
                $session_id: sessionId,
                $imsi: request.imsi || "",
                $core_Body: input,
                $cellid: request.cellid || "",
            };
            const _shortcode = shortcode || ussdString || input;
            // check if there is lac, mcc, mnc etc
            if (request.lac && request.mcc) {
                state.$cellid = `${request.mcc}${request.mnc}${request.lac}${request.cellid}`;
            }
            // the session does not exist so we need to create it for the first time.
            if (!subSession) {
                // the first time request, the input is the same as the shortcode
                state.$shortcode = _shortcode;
                // if the sid is not found return without processing the request since there is no configuration matching
            } else {
                state.$shortcode = subSession.$shortcode;
            }

            const sid = await this.getSid(state.$shortcode);
            if (!sid) {
                logger.warn(`SID information not found. ShortCode = ${state.$shortcode}`);
                return {
                    continue: false,
                    message: this.defaultErrorMsg,
                };
            }
            const rvdController = new RVDNode({
                session: subSession,
                state,
                cache: redis,
                rvdjson: this.rvdjson,
                config: {
                    workSpaceDir: this.defaultWorkSpace,
                    sid,
                },
            });

            const response = await rvdController.rvd(input);

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
