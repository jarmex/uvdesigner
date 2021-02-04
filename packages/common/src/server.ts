import * as express from "express";
import { IController } from "./types";

class CommonApp {
  public app: express.Application;
  public port: number;
  public routePath: string;

  constructor(
    controllers: IController[],
    portNumber: number,
    routepath: string
  ) {
    this.app = express();
    this.port = portNumber;
    this.routePath = routepath;
    this.initializeControllers(controllers);
    this.initializeMiddleware();
  }

  /**
   * initialize Middleware
   */
  private initializeMiddleware() {
    this.app.use(express.urlencoded({ extended: false }));
  }

  /**
   * Additional function to run using the express app.
   *
   * @param {Function} callbackfn - a callback function that takes the express app as parameter and return void
   */
  public func(callbackfn: (app: express.Application) => void) {
    callbackfn(this.app);
  }
  /**
   * initializeControllers.
   *
   * @param {IController[]} controllers - the list of controllers to be initialized
   */
  private initializeControllers(controllers: IController[]) {
    controllers.forEach((controller) => {
      this.app.use(this.routePath, controller.router);
    });
  }
  /**
   * Application Listing on the configured port
   *
   * @param {string} message - the message to be printed in the console.
   * @param {Function} callback - a callback function
   */

  public listen(message?: string, callback?: () => void) {
    this.app.listen(this.port, () => {
      if (message) {
        console.log(message);
      } else {
        console.log(`Application running on port ${this.port}`);
      }
      // call back function
      if (callback) {
        callback();
      }
    });
  }
}

export default CommonApp;
