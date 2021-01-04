import { ReplaceVariables } from "./ReplaceVariables";
import { getLogger } from "../utils/logger";

const logger = getLogger("Log");

export default class LogSteps {
    process = async (step: any, appdata = {}, tempdata = {}) => {
        const { message } = step;

        if (message) {
            const logmsg = ReplaceVariables(message, appdata, tempdata);
            logger.info("LogSteps: " + logmsg);
        }
    };
}
