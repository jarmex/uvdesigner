import axios, { AxiosRequestConfig } from "axios";
import { JSONPath } from "jsonpath-plus";
import { ReplaceVariables } from "./ReplaceVariables";
import { getLogger } from "../utils/logger";
import ensureArray from "./ensureArray";
import { xml2json } from "xml-js";

const logger = getLogger("ExternalService");

export default class ExternalServiceSteps {
    process = async (step: any, appdata = {}, tempdata = {}) => {
        const data: any = { ...appdata };
        const temp: any = { ...tempdata };
        let continueTo = null;
        const {
            httpHeaders,
            contentType,
            urlParams,
            requestBody,
            url,
            next,
            nextType,
            nextValueExtractor,
            username,
            password,
            title,
            timeout,
            method,
            assignments,
            doRouting,
            exceptionNext,
            onTimeout,
            routeMappings,
        } = step;
        logger.debug(
            `ExternalServiceSteps: Username: ${username}, Password: ${password}, title: ${title}, timeout: ${timeout}`
        );

        const axiosConfig: AxiosRequestConfig = {};

        const headers: any = {};
        // add the header if it exist
        if (httpHeaders) {
            httpHeaders.forEach((hd: any) => {
                headers[hd.name] = ReplaceVariables(hd.value, data, temp);
            });
        }

        // if there is content header
        if (contentType) {
            headers["Content-Type"] = contentType;
        } else {
            headers["Content-Type"] = "application/json";
        }
        // add the header
        axiosConfig.headers = headers;

        // add the params
        const allParams = ensureArray(urlParams);
        if (allParams.length > 0) {
            const params: any = {};
            allParams.forEach((urlp: any) => {
                params[urlp.name] = ReplaceVariables(urlp.value, data, temp); // check the variables
            });
            axiosConfig.params = params;
        }

        // add the requestBody
        if (requestBody && method && method.toLowerCase() !== "get") {
            axiosConfig.data = ReplaceVariables(requestBody, data, temp);
        }

        // add timeout
        if (timeout !== undefined) {
            axiosConfig.timeout = parseInt(timeout);
        }

        // add the username and password
        if (username && password) {
            axiosConfig.auth = {
                username,
                password,
            };
        }

        // add the url
        if (url !== undefined) {
            axiosConfig.url = ReplaceVariables(url, data, temp);
        }
        if (method !== undefined) {
            axiosConfig.method = method;
        } else {
            axiosConfig.method = "GET";
        }
        // if the url exist proceed
        try {
            logger.debug(`request: ${JSON.stringify(axiosConfig)}`);

            const { data: axiosdata, status, statusText, headers: responseHeader } = await axios(axiosConfig);

            logger.debug(`Response: Status = ${status}(${statusText}), data=${axiosdata}`);

            if (assignments && Array.isArray(assignments)) {
                const conType = responseHeader["content-type"];
                // extract the values into the variables
                assignments.forEach((assign: any) => {
                    const querypath = assign.valueExtractor || "";
                    if (conType.match(/text\/plain;.*/gi)) {
                        logger.debug(`processing content-type = ${conType}`);
                        if (assign.scope === "module") {
                            temp[`$${assign.destVariable}`] = axiosdata;
                        } else {
                            data[`$${assign.destVariable}`] = axiosdata;
                        }
                    } else if (conType.match(/application\/json.*/gi)) {
                        let result = JSONPath({ path: querypath, json: axiosdata })[0] || "";

                        logger.debug(` Assign => ${querypath} = ${result}`);
                        if (assign.scope === "module") {
                            temp[`$${assign.destVariable}`] = result;
                        } else {
                            data[`$${assign.destVariable}`] = result;
                        }
                    } else if (conType.match(/(application|text)\/xml.*/gi)) {
                        let xmlParsedJson = xml2json(axiosdata, {
                            compact: true,
                            ignoreDeclaration: true,
                            elementNameFn: function (name: string) {
                                return name.slice(name.search(":") + 1);
                            },
                            ignoreComment: true,
                            ignoreAttributes: true,
                        });
                        let result = JSONPath({ path: `${querypath}._text`, json: xmlParsedJson })[0] || "";
                        logger.debug(` Assign => ${querypath} = ${result}`);
                        if (assign.scope === "module") {
                            temp[`$${assign.destVariable}`] = result;
                        } else {
                            data[`$${assign.destVariable}`] = result;
                        }
                    } else {
                        logger.info(`Un-coded content-type of ${conType}`);
                        if (assign.scope === "module") {
                            temp[`$${assign.destVariable}`] = axiosdata;
                        } else {
                            data[`$${assign.destVariable}`] = axiosdata;
                        }
                    }
                });
            }
            if (doRouting === true) {
                // route based on the response
                if (nextType === "fixed") {
                    continueTo = next;
                } else if (nextType === "mapped") {
                    const result = JSONPath({ path: nextValueExtractor || "", json: axiosdata })[0] || "";
                    const rtMapping = ensureArray(routeMappings).find(y => y.value === result);
                    if (rtMapping) {
                        continueTo = rtMapping.next;
                    }
                } else {
                    logger.warn("Unknown nextType configured");
                }
            }
            // EXTRACT DATA HERE
        } catch (error) {
            logger.error(`ErrorCode = ${error.code}, Status = ${error.status}, (${error.message})`);
            if (error.code === "ECONNABORTED") {
                continueTo = onTimeout || "";
            } else if (error.response) {
                logger.error(error.response.data);
                // no need to process if there is an error
            }
            if (exceptionNext) {
                continueTo = exceptionNext;
            }
        }

        return {
            continueTo,
            data,
            temp,
        };
    };
}
