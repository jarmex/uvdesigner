import { IController } from "@uvdesigner/common";
import { Router, Request, Response } from "express";
import * as bodyParser from "body-parser";

class TruRoute implements IController {
  public router: Router = Router();
  private path: string = "/truroute";
  constructor() {
    this.initRoutes();
  }
  public initRoutes() {
    const rawParser = bodyParser.raw({
      type: function () {
        return true;
      },
      limit: "1mb",
    });
    this.router.post(this.path, rawParser, this.handleUSSDRequest);
  }

  handleUSSDRequest = async (req: Request, resp: Response) => {
    resp.send("Success");
  };
}

export default TruRoute;
