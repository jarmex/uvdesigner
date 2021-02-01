import * as express from "express";
import { IController } from "./types";

class App {
  public app: express.Application;
  public port: number;
  constructor(controllers: IController[], port: number) {
    this.app = express();
    this.port = port;
    this.initialController(controllers);
    this.initializeMiddleware();
  }

  private initialController(controllers: IController[]) {
    controllers.forEach((controller) => {
      this.app.use("/ussd", controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log("Application listening on port " + this.port);
    });
  }
}

export default App;
