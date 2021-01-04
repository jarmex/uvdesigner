const Environment = {
    nodeEnv: process.env.ENV || process.env.NODE_ENV,
    logDir: process.env.LOG_DIR || "logs",
    logLevel: process.env.LOG_LEVEL || "debug",
    logFile: process.env.LOG_FILE || "app.log",
    jwtSecret: process.env.JWT_SECRET || "aDAa34AD(&@adDASd#a)",
    redis: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
    },
    serverPort: parseInt(process.env.SERVER_PORT || "8001"),
    connector: {
        MTN: process.env.MTN_CONNECTOR_URL,
    },
    UssdRetry: parseInt(process.env.USSD_RETRY_ATTEMPT || "3"),
    UssdRetryInterval: parseInt(process.env.USSD_RETRY_INTERVAL || "1") * 1000,
    sessionTimeout: parseInt(process.env.USSD_SESSION_TIMEOUT || "30"),
    defaultErrorMsg: process.env.DEFAULT_ERR_MESSAGE || "Error - unknown",
    defaultWorkSpace: process.env.DEFAULT_WORKSPACE,
    corsOrigin: process.env.CORS_ORIGIN || "*",
};

export default Environment;
