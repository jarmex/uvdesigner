import { promisify } from "util";
import { readFile } from "fs";
import { join } from "path";
import { Kinds, ussdCollectGatherType } from "./Constants";
import UssdSaySteps from "./UssdSay";
import UssdCollectSteps from "./UssdCollectStep";
import LogSteps from "./logStep";
import ExternalServiceSteps from "./ExternalServiceStep";
import ControlSteps from "./ControlSteps";
import { getLogger } from "../utils/logger";
import { IGenericObj } from "./types";
import { AsyncRedis } from "./AsyncRedis";

const logger = getLogger("RVD");

const isObjEmpty = (obj: any) => {
    if (obj !== undefined && obj !== null && typeof obj === "object") {
        return Object.keys(obj).length === 0;
    }
    return true;
};

type RVDProcess = (moduleName: string) => any;
// create a promise version of the fs readFile
const freadAsync = promisify(readFile);

export default class RVDNode {
    // declare class variables
    sessionInfo: IGenericObj;
    temp: IGenericObj;
    cache: AsyncRedis;
    data: IGenericObj;
    responses: any;
    config: IGenericObj;
    rvdjson: IGenericObj;

    constructor(options: IGenericObj = {}) {
        const { session = {}, cache, state = {}, rvdjson = {}, config = {} } = options;

        this.sessionInfo = session;

        this.temp = {};

        if (!cache) {
            throw new Error("The cache cannot be empty");
        }

        this.cache = cache;

        if (!isObjEmpty(session)) {
            const { responses, ...rest } = session;
            this.responses = responses;
            this.data = { ...rest, ...state };
        } else {
            this.data = state;
            this.responses = null;
        }

        this.rvdjson = rvdjson;
        this.config = config;
    }

    readStates = async (shortcode: string) => {
        let retvalue = null;
        try {
            const rvdjs = await this.cache.getAsync(shortcode);
            if (rvdjs && !isObjEmpty(rvdjs)) {
                return JSON.parse(rvdjs);
            }
            const { sid, workSpaceDir } = this.config;
            if (sid && workSpaceDir) {
                try {
                    const spath = join(workSpaceDir, sid, "state");
                    const result = await freadAsync(spath, "utf8");
                    await this.cache.setAsync(shortcode, result);
                    retvalue = JSON.parse(result);
                } catch (error) {
                    logger.error(error.message);
                }
            } else {
                logger.error("Invalid SID or WORKSPACE_DIR");
            }
        } catch (error) {
            logger.error(error.message);
        }
        if (retvalue) {
            return retvalue;
        }
        logger.debug("Caching the shortcode to memory....");

        await this.cache.setAsync(shortcode, JSON.stringify(this.rvdjson));
        return this.rvdjson;
    };

    /**
     *Process the RVD for USSD
     * @param {String} moduleName the name of the module to load for the USSD flow
     * @memberof RVDNode
     */
    rvdProcess: RVDProcess = async (moduleName: string) => {
        const { $core_From: msisdn, $cell_id: cellid, $shortcode } = this.data;
        const cRvd = await this.readStates($shortcode);
        const allnodes = cRvd.nodes.find((item: any) => item.name === moduleName);
        const moduleLabel = allnodes ? allnodes.label : "";
        logger.info(`MODULE: ${moduleName}, NAME: ${moduleLabel}, MSISDN=${msisdn}, cellid=${cellid}`);
        if (!allnodes) {
            return {
                data: null,
                next: false,
            }; // for the error message
        }

        let continueTo = null;
        const retmsg: IGenericObj = {
            next: false,
            rvdmodule: { moduleName, moduleLabel },
        };
        const { steps } = allnodes;

        // process all the steps in the module. Check for each of the steps and call the
        // appropriate control to process it.
        // eslint-disable-next-line
        for (let i = 0; i < steps.length; i++) {
            const item = steps[i];
            // need to stored in the database
            retmsg.rvdmodule.stepName = item.name;
            retmsg.rvdmodule.stepKind = item.kind;
            logger.debug(`Processing step: ${item.name || ""}, kind: ${item.kind}`);
            // process the ControlStep
            if (item.kind === Kinds.control) {
                const ctrlStep = new ControlSteps();
                // eslint-disable-next-line
                const retdata = await ctrlStep.process(item, this.data, this.temp, moduleName);

                this.data = Object.assign(this.data, retdata.data);
                this.temp = Object.assign(this.temp, retdata.temp);
                if (retdata.continueTo) {
                    // eslint-disable-next-line
                    continueTo = retdata.continueTo;
                    break;
                }
            } else if (item.kind === Kinds.externalService) {
                // process the external service
                const extStep = new ExternalServiceSteps();
                // eslint-disable-next-line
                const exdata = await extStep.process(item, this.data, this.temp);

                this.data = Object.assign(this.data, exdata.data);
                this.temp = Object.assign(this.temp, exdata.temp);
                // break the flow and continue to the next module if continueTo is defined
                if (exdata.continueTo) {
                    continueTo = exdata.continueTo;
                    break;
                }
            } else if (item.kind === Kinds.log) {
                // process the logSteps
                const logStep = new LogSteps();
                logStep.process(item, this.data, this.temp);
            } else if (item.kind === Kinds.ussdCollect) {
                // process the ussdCollect steps
                const colData = new UssdCollectSteps();
                // eslint-disable-next-line
                const ucollect = await colData.process(item, this.data, this.temp);
                retmsg.message = ucollect.message;
                retmsg.next = true;
                this.data = Object.assign(this.data, {
                    responses: ucollect.responses,
                });
                break;
            } else if (item.kind === Kinds.ussdSay) {
                // process the ussd say steps
                const uSay = new UssdSaySteps();
                // eslint-disable-next-line
                const uMsg = await uSay.process(item, this.data, this.temp);
                retmsg.message = uMsg.message;
                retmsg.next = false;
            } else {
                logger.info(JSON.stringify(item));
            }
        }
        if (continueTo) {
            return this.rvdProcess(continueTo);
        }
        // return the message
        retmsg.data = { ...this.data };
        return retmsg;
    };

    /**
     * check if a user session already exist. If so pick the information from the session
     * and process it. If the user session does not exist, it assume that the input is the shortcode
     * and queries the database using the shortcode
     * @param {String} input the USSD input string
     * @memberof RVDNode
     */
    rvd = async (input: string) => {
        // check if the session exist
        if (this.sessionInfo) {
            // check if there input is in relation with a response
            if (this.responses) {
                const { menu, collectdigits } = ussdCollectGatherType;
                // map through to get the next module
                if (this.responses.gatherType === menu) {
                    const uinput = parseInt(input, 10);
                    const mm = this.responses.mappings.find((rep: any) => parseInt(rep.digits, 10) === uinput);
                    if (mm) {
                        return this.rvdProcess(mm.next);
                    }
                    // PROCESS WHEN INFO DOES NOT EXIST
                } else if (this.responses.gatherType === collectdigits) {
                    const { next, collectVariable, scope } = this.responses.collectdigits;
                    if (scope === "application") {
                        this.data[`$${collectVariable}`] = input;
                    } else {
                        this.temp[`$${collectVariable}`] = input;
                    }
                    return this.rvdProcess(next);
                }
            } else {
                return this.rvdProcess(this.sessionInfo.moduleName);
            }
        }
        const defaultRVD = await this.readStates(this.data.$shortcode);

        const currentModule = defaultRVD.header.startNodeName;
        return this.rvdProcess(currentModule);
    };
}
