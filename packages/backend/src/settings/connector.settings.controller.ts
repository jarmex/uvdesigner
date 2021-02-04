import { Connector, HttpException, IController } from "@uvdesigner/common";
import { AccountDatabase } from "db";
import { AirtelTigoSettings, AirtelTigoSettingsDto, MTNSettings, MtnSettingsDto } from "db/settings.dto";
import { NextFunction, Router, Request, Response } from "express";
import { validationMiddleware } from "middleware/validation.middleware";

class ConnectorSettingController implements IController {
    public router = Router();
    private path: string = "/settings";
    private db: AccountDatabase;
    constructor() {
        this.db = new AccountDatabase();
        this.initRoutes();
    }
    public initRoutes() {
        this.router.post(this.path, this.handleSettingRequest);
        this.router.post(`${this.path}/mtn`, validationMiddleware(MtnSettingsDto), this.handleMTNUpdate);
        this.router.post(
            `${this.path}/airteltigo`,
            validationMiddleware(AirtelTigoSettingsDto),
            this.handleAirtelTigoUpdate
        );
    }

    handleSettingRequest = (req: Request, resp: Response, next: NextFunction) => {
        const connector = req.body.connector as Connector;
        if (!connector) {
            next(new HttpException(404, "Resource does not exist"));
            return;
        }
        const settings = this.db.getSettings(connector);
        if (settings === null) {
            next(new HttpException(404, "Resource does not exist for the connector"));
            return;
        }
        resp.send(settings);
    };

    handleMTNUpdate = (req: Request, res: Response, next: NextFunction) => {
        try {
            const mtnSetting: MtnSettingsDto = req.body;
            this.db.updateMtnSettings(
                new MTNSettings(
                    mtnSetting.spPassword,
                    mtnSetting.timeStamp,
                    mtnSetting.endpoint,
                    mtnSetting.services,
                    mtnSetting.timeout,
                    mtnSetting.baseUrl
                )
            );
            res.send({ message: "success" });
        } catch (error) {
            next(new HttpException(404, error.message));
        }
    };
    handleAirtelTigoUpdate = (req: Request, res: Response, next: NextFunction) => {
        const airtelTigo: AirtelTigoSettingsDto = req.body;
        try {
            this.db.updateAirtelTigoSetting(new AirtelTigoSettings(airtelTigo.baseUrl));
            res.send({ message: "success" });
        } catch (error) {
            next(new HttpException(404, error.message));
        }
    };
}

export default ConnectorSettingController;
