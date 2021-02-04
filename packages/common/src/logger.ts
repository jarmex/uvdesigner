import { configure, getLogger, connectLogger } from "log4js";
import { existsSync } from "fs";

// appenders
const appConfig = {
  pm2: true,
  disableClustering: true,
  appenders: {
    console: { type: "stdout", layout: { type: "colored" } },
    dateFile: {
      type: "dateFile",
      filename: "./logs/application_log",
      layout: { type: "basic" },
      compress: true,
      daysToKeep: 30,
      keepFileExt: true,
    },
    access: {
      type: "dateFile",
      filename: "./logs/access.log",
      pattern: "-yyyy-MM-dd",
      category: "http",
    },
  },
  categories: {
    default: {
      appenders: ["console", "dateFile"],
      level: "debug",
    },
    http: { appenders: ["access"], level: "debug" },
  },
};

try {
  if (existsSync("../data/log4js.json")) {
    configure("../data/log4js.json");
  } else {
    configure(appConfig);
  }
} catch (ex) {
  console.log(ex.message);
}
// fetch logger and export
export const logger = getLogger();
export { getLogger };
export const conLogger = (l: string) =>
  connectLogger(getLogger("http"), { level: l });
