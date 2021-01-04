import { configure, getLogger, connectLogger, Logger } from "log4js";
import Environment from "../shared/environment";
import { existsSync, mkdirSync } from "fs";
// appenders
const appConfig = {
    //pm2: true,
    //disableClustering: true,
    appenders: {
        console: { type: "stdout", layout: { type: "colored" } },
        dateFile: {
            type: "dateFile",
            filename: `${Environment.logDir}/${Environment.logFile}`,
            layout: { type: "basic" },
            compress: true,
            daysToKeep: 30,
            keepFileExt: true,
        },
        access: {
            type: "dateFile",
            filename: `${Environment.logDir}/http.log`,
            pattern: "-yyyy-MM-dd",
            category: "http",
        },
        out: { type: "console", layout: { type: "basic" } },
        accessdefault: {
            type: "dateFile",
            filename: `${Environment.logDir}/http.log`,
            pattern: "-yyyy-MM-dd",
            category: "http",
        },
    },
    categories: {
        default: {
            appenders: ["console", "dateFile"],
            level: Environment.logLevel,
        },
        http: { appenders: ["accessdefault"], level: "debug" },
    },
};

try {
    if (existsSync("../data/log4js.json")) {
        configure("../data/log4js.json");
    } else {
        configure(appConfig);
    }
    mkdirSync(Environment.logDir, { recursive: true });
} catch (ex) {
    console.log(ex.message);
}
export const conLogger = (level: string = "auto") => {
    return connectLogger(getLogger("http"), { level });
};
// fetch logger and export
export const logger = getLogger();
export { getLogger, Logger };
