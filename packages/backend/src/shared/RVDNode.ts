import { Kinds, ussdCollectGatherType } from "./Constants";
import UssdSaySteps from "./UssdSay";
import UssdCollectSteps from "./UssdCollectStep";
import LogSteps from "./logStep";
import ExternalServiceSteps from "./ExternalServiceStep";
import ControlSteps from "./ControlSteps";
import { getLogger } from "../utils/logger";
import { IGenericObj } from "./types";
import { ShortCodeDb } from "../db";

const logger = getLogger("RVD");

/*const isObjEmpty = (obj: any) => {
    if (obj !== undefined && obj !== null && typeof obj === "object") {
        return Object.keys(obj).length === 0;
    }
    return true;
};
*/

export default class RVDNode {
    // declare class variables
    private temp: IGenericObj;
    private data: IGenericObj;
    private db: ShortCodeDb;
    private rvdjson: any;
    private startModule: string;

    constructor(state: IGenericObj = {}) {
        this.db = new ShortCodeDb();
        this.temp = {};
        this.data = { ...state };
    }

    public async readRvdData() {
        if (!this.rvdjson) {
            const serviceData = await this.db.getServiceIdData(this.data.$serviceId);
            if (!serviceData) {
                throw new Error("Unknown serviceId request");
            }

            if (serviceData && serviceData.nodes && !Array.isArray(serviceData.nodes)) {
                throw new Error("Unknown node for the serviceId");
            }
            this.rvdjson = serviceData;
            this.startModule = serviceData.header.startNodeName;
        }
    }
    /**
     * Process the RVD for USSD
     * @param {String} moduleName the name of the module to load for the USSD flow
     * @memberof RVDNode
     */
    private async processNodeModule(moduleStartName: string): Promise<any> {
        const { $core_From: msisdn, $cell_id: cellid } = this.data;
        const moduleName = moduleStartName || this.startModule;
        const allnodes = this.rvdjson.nodes.find((item: any) => item.name === moduleName);
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
            return this.processNodeModule(continueTo);
        }
        // return the message
        retmsg.data = { ...this.data };
        return retmsg;
    }

    /**
     * check if a user session already exist. If so pick the information from the session
     * and process it. If the user session does not exist, it assume that the input is the shortcode
     * and queries the database using the shortcode
     * @param {String} input the USSD input string
     * @memberof RVDNode
     */
    public async processInput(input: string): Promise<any> {
        // check if the session exist
        // check if there input is in relation with a response
        if (this.data.responses) {
            const response = this.data.responses;
            const { menu, collectdigits } = ussdCollectGatherType;
            // map through to get the next module
            if (response.gatherType === menu) {
                const uinput = parseInt(input, 10);
                const userMenuResponse = response.mappings.find((rep: any) => parseInt(rep.digits, 10) === uinput);
                if (userMenuResponse) {
                    return this.processNodeModule(userMenuResponse.next);
                }
                // PROCESS WHEN INFO DOES NOT EXIST
            } else if (response.gatherType === collectdigits) {
                const { next, collectVariable, scope } = response.collectdigits;
                if (scope === "application") {
                    this.data[`$${collectVariable}`] = input;
                } else {
                    this.temp[`$${collectVariable}`] = input;
                }
                return this.processNodeModule(next);
            }
        }
        return this.processNodeModule(this.data.moduleName);
    }
}
