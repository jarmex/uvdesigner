import { Router, Response, NextFunction } from "express";
import { IController, UVDException } from "@uvdesigner/common";
import { ShortCodeDb } from "../db/shortcode.db";
import { validationMiddleware } from "../middleware/validation.middleware";
import { ShortCodeDto } from "./uvd.dto";
import authMiddleware from "../middleware/auth.middleware";
import RequestWithAccount from "../interfaces/requestWithUser.interface";
import { getLogger, Logger } from "../utils";

export class UVDController implements IController {
    public path: string = "/uvd";
    public router: Router = Router();
    private sDb: ShortCodeDb;
    private log: Logger;
    constructor() {
        this.log = getLogger("uvd");
        this.sDb = new ShortCodeDb();
        this.sDb.readAllShortcodes();
        this.initRoutes();
    }
    public initRoutes() {
        this.router.use(this.path, authMiddleware);
        this.router.post(`${this.path}/save`, this.saveUVD);
        this.router.post(`${this.path}/shortcode/create`, validationMiddleware(ShortCodeDto), this.createShortCode);
        this.router.delete(`${this.path}/shortcode/:id`, this.deleteUVD);
        this.router.get(`${this.path}/shortcodes`, this.getAllShortCodes);
        this.router.get(`${this.path}/:id`, this.readUVD);
    }

    createShortCode = async (req: RequestWithAccount, resp: Response, next: NextFunction) => {
        const sdata: ShortCodeDto = req.body;
        try {
            const result = await this.sDb.createShortCode(sdata.mapKey, sdata.description);

            resp.send({
                status: 0,
                message: { ...result },
            });
        } catch (error) {
            this.log.error(error);
            next(new UVDException(error.message));
        }
    };

    getAllShortCodes = async (_: RequestWithAccount, resp: Response, next: NextFunction) => {
        try {
            const result = await this.sDb.getAllShortCodes();
            resp.send({
                status: 0,
                message: result,
            });
        } catch (error) {
            next(new UVDException(error.message));
        }
    };

    deleteUVD = async (req: RequestWithAccount, resp: Response, next: NextFunction) => {
        try {
            const serviceId = req.params.id;

            const result = await this.sDb.removeShortCode(serviceId);
            resp.send({
                status: 0,
                message: result,
            });
        } catch (error) {
            next(new UVDException(error.message));
        }
    };

    saveUVD = async (req: RequestWithAccount, resp: Response, next: NextFunction) => {
        const { serviceId, message } = req.body;
        try {
            const sData = await this.sDb.getShortCode(serviceId);
            if (sData) {
                // save the data using the serviceId as the folder name
                /*
                const statefolder = join(process.cwd(), "workspaces", sData.serviceId);
                if (!existsSync(statefolder)) {
                    mkdirSync(statefolder, { recursive: true });
                }
                const statefile = join(statefolder, "state");
                writeFileSync(statefile, JSON.stringify(message), { flag: "w" });

                */
                await this.sDb.updateServiceId(serviceId, message);
                resp.send({
                    status: 0,
                    message: "UVD Saved successfully",
                });
            } else {
                next(new UVDException("The Service Id does not exist"));
            }
        } catch (error) {
            next(new UVDException(error.message));
        }
    };

    readUVD = async (req: RequestWithAccount, resp: Response, next: NextFunction) => {
        try {
            const serviceId = req.params.id;
            const sdata = await this.sDb.getServiceIdData(serviceId);
            if (!sdata) {
                //next(new UVDException("Service Id does not exist"));
                resp.send({
                    status: 1,
                    message: {},
                });
            } else {
                resp.send({
                    status: 0,
                    message: sdata,
                });
            }
        } catch (error) {
            next(new UVDException(error.message));
        }
    };
}
