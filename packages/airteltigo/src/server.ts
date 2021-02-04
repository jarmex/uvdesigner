import { CommonApp } from "@uvdesigner/common";
import AirtelTigoController from "./Controllers/AirtelTigoController";

const app = new CommonApp([new AirtelTigoController()], 9001, "/ussd");

app.listen("App running on port 9001", () => {
  //console.log(app.app._router.stack);
});
