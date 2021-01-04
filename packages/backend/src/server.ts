import "dotenv/config";
import { AuthenticationController } from "./authentication/authentication.controller";
import App from "./app";
import { UVDController } from "./uvd/uvd.controller";
import Environment from "./shared/environment";
import { UssdPullController } from "./pull/pull.controller";

const app = new App(
    [new AuthenticationController(), new UVDController(), new UssdPullController()],
    Environment.serverPort
);

app.listen();
