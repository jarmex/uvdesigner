import { ConOperator, ConType } from "./Constants";
import { ReplaceVariables } from "./ReplaceVariables";
import ensureArray from "./ensureArray";
import { getLogger } from "../utils/logger";

const logger = getLogger("Control");

export default class ControlSteps {
    process = async (step: any, applicationdata: any, temporaryData: any, moduleName: string) => {
        const appdata: any = applicationdata || {};
        const tempdata: any = temporaryData || {};
        const data: any = { ...appdata };
        const temp: any = { ...tempdata };
        let continueTo = null;
        // check for the conditions and loop through
        let isValid = true; // default to through
        const { conditions, actions: reAction, conditionExpression } = step;
        // get the conditionExpression
        const conditionResults: any = {};
        // loop through to check all the conditions are met
        if (conditions) {
            // each condition
            conditions.forEach((cod: any) => {
                // equal to
                const { operand1, operand2, type: mtype } = cod.comparison;
                const first = ReplaceVariables(operand1, data, temp);
                const second = ReplaceVariables(operand2, data, temp);
                let op1: any = first;
                let op2: any = second;
                if (mtype === ConType.numeric) {
                    op1 = parseFloat(first);
                    op2 = parseFloat(second);
                }
                // debug(`isValid before expression evaluation = ${isValid}`);
                const name = (cod.name || "").toLowerCase();
                switch (cod.operator) {
                    case ConOperator.eq:
                        conditionResults[name] = op1 === op2;
                        break;
                    case ConOperator.gt:
                        conditionResults[name] = op1 > op2;
                        break;
                    case ConOperator.lt:
                        conditionResults[name] = op1 < op2;
                        break;
                    case ConOperator.gte:
                        conditionResults[name] = op1 >= op2;
                        break;
                    case ConOperator.lte:
                        conditionResults[name] = op1 <= op2;
                        break;
                    case ConOperator.ne:
                        conditionResults[name] = op1 !== op2;
                        break;
                    default:
                        conditionResults[name] = op1 === op2;
                        break;
                }
                logger.debug(`ControlSteps: ${cod.name}: ${op1} "${cod.operator}" ${op2} = ${conditionResults[name]}`);
            });
        }
        // check for the condition expression
        if (conditionExpression) {
            const conditionSplit = conditionExpression.toLowerCase().split(" ");
            let prevAnd = false;
            let prevOr = false;
            // C1 AND C2 AND C3 => c1 and c2 and c3 => ['c1', 'and', 'c2', 'or', 'c3' ]
            conditionSplit.forEach((nameOrcond: any) => {
                if (nameOrcond === "and") {
                    // hold onto the and!!
                    prevAnd = true;
                    prevOr = false;
                } else if (nameOrcond === "or") {
                    prevOr = true;
                    prevAnd = false;
                } else {
                    const resultExist = conditionResults[nameOrcond];
                    // check if result computed exist
                    if (resultExist !== undefined) {
                        if (prevAnd) {
                            // the operand was AND
                            isValid = isValid && conditionResults[nameOrcond];
                            prevAnd = false;
                        } else if (prevOr) {
                            // the operand was OR
                            isValid = isValid || conditionResults[nameOrcond];
                            prevOr = false;
                        } else {
                            isValid = resultExist;
                        }
                    }
                }
            });
        }
        logger.debug(`ControlSteps:  isValid = ${isValid}`);
        // take Actions
        if (isValid) {
            const actions = ensureArray(reAction);
            // eslint-disable-next-line
            for (let j = 0; j < actions.length; j++) {
                const act = actions[j];
                if (act.assign) {
                    const expr = ReplaceVariables(act.assign.expression, data, temp);
                    if (act.assign.varScope === "app") {
                        data[`$${act.assign.varName}`] = expr;
                    } else {
                        temp[`$${act.assign.varName}`] = expr;
                    }
                }
                // capture
                if (act.capture) {
                    try {
                        const { data: capdata, regex } = act.capture;
                        const strdata = ReplaceVariables(capdata, data, temp);
                        const mex = new RegExp(regex, "g");
                        const value = strdata.match(mex);
                        if (value) {
                            data[`$${act.capture.varName}`] = value[0]; // eslint-disable-line
                        }
                    } catch (error) {
                        logger.error(`ControlSteps: ${error.message}`);
                    }
                }
                // check if there is contineTo
                if (act.continueTo) {
                    const { target } = act.continueTo;
                    if (!target) {
                        logger.error("ControlSteps: No target module specified");
                    } else if (target && target === moduleName) {
                        logger.error("Cyclic module execution detected");
                    } else {
                        continueTo = target;
                    }
                    break;
                }
            }
        }

        return {
            data,
            temp,
            continueTo,
        };
    };
}
