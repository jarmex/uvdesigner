import "dotenv/config";
import { AuthenticationController } from "./authentication/authentication.controller";
import App from "./app";
import { UVDController } from "./uvd/uvd.controller";
import Environment from "./shared/environment";
import { UssdPullController } from "./pull/pull.controller";
import ConnectorSettingController from "./settings/connector.settings.controller";
import { HealthzController } from "./services/healthz.controller";

const app = new App(
    [
        new AuthenticationController(),
        new UVDController(),
        new UssdPullController(),
        new ConnectorSettingController(),
        new HealthzController(),
    ],
    Environment.serverPort
);

app.listen();
