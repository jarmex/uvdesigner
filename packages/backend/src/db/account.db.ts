import { plainToClass } from "class-transformer";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { AccountData } from "./account.dto";
import { v4 } from "uuid";
import { dirname, join } from "path";
import { getLogger, Logger } from "../utils";
import { AirtelTigoSettings, ConnectorSettings, MTNSettings } from "./settings.dto";
import { Connector } from "@uvdesigner/common";

type SaveType = "Setting" | "Account";

type ConSettings = MTNSettings | AirtelTigoSettings | null;

export class AccountDatabase {
    private filepath: string;
    private db: Array<AccountData> = new Array<AccountData>();
    private log: Logger;
    private settingFile: string;
    private connectorSetting: ConnectorSettings;
    private saveType: SaveType;

    constructor() {
        this.log = getLogger("account");
        this.filepath = this.getFilePath("accounts.json");
        this.settingFile = this.getFilePath("settings.json");
        this.readFileContent();
        this.readSettingsFile();
    }

    private getFilePath(filename: string): string {
        try {
            const folderpath = join(process.cwd(), "accounts");
            if (!existsSync(folderpath)) {
                mkdirSync(folderpath, { recursive: true });
            }
        } catch (error) {
            this.log.error(error.message);
        }
        const fpath = join(process.cwd(), "accounts", filename);
        return fpath;
    }
    private readSettingsFile() {
        try {
            if (!existsSync(this.settingFile)) {
                this.connectorSetting = new ConnectorSettings();
                return;
            }
            const data = readFileSync(this.settingFile);
            this.connectorSetting = plainToClass(ConnectorSettings, JSON.parse(data.toString("utf8")));
        } catch (error) {
            this.log.error(error.message);
        }
    }
    private readFileContent() {
        try {
            if (!existsSync(this.filepath)) {
                return;
            }
            const data = readFileSync(this.filepath);
            const allAccount = JSON.parse(data.toString("utf8"));
            if (Array.isArray(allAccount)) {
                this.db = plainToClass(AccountData, allAccount);
            }
        } catch (error) {
            this.log.error(error.message);
        }
    }

    private save(sv: SaveType = "Account") {
        try {
            const dir = dirname(this.filepath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            if (sv === "Account") {
                writeFileSync(this.filepath, JSON.stringify(this.db));
            } else {
                writeFileSync(this.settingFile, JSON.stringify(this.connectorSetting));
            }
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    public addAccount(username: string, password: string): Promise<AccountData> {
        return new Promise((resolve, reject) => {
            try {
                // check if the username already exist.
                const isExist = this.db.findIndex(u => u.username === username);
                if (isExist !== -1) {
                    reject(new Error("User already exist"));
                    return;
                }
                const acnt: AccountData = new AccountData();

                acnt.id = v4();
                acnt.createdDate = new Date().toString();
                acnt.username = username;
                acnt.password = password;

                this.db.push(acnt);
                this.save();
                resolve(acnt);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getAccount(username: string): Promise<AccountData | null> {
        return new Promise(resolve => {
            console.log(this.db);
            const acnt = this.db.find(a => a.username === username);
            if (acnt) {
                resolve(acnt);
            } else {
                resolve(null);
            }
        });
    }

    // this is to check if account has been created before
    public getAccountLength(): Promise<number> {
        return new Promise(resolve => {
            if (this.db) {
                resolve(this.db.length);
            } else {
                resolve(0);
            }
        });
    }

    public getAccountbyId(id: string): Promise<AccountData | null> {
        return new Promise(resolve => {
            const acnt = this.db.find(a => a.id === id);
            if (acnt) {
                resolve(acnt);
            } else {
                resolve(null);
            }
        });
    }

    public removeAccount(accountId: string): Promise<AccountData> {
        return new Promise((resolve, reject) => {
            const idx = this.db.findIndex(y => y.id === accountId);
            if (idx !== -1) {
                try {
                    const delData = this.db[idx];
                    this.db.splice(idx, 1);
                    this.save();
                    resolve(delData);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    public updateAccount(acntId: string, updateAcnt: AccountData): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const idx = this.db.findIndex(y => y.id === acntId);
            if (idx >= 0) {
                try {
                    this.db[idx] = updateAcnt;
                    this.save();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(false);
            }
        });
    }
    public updateMtnSettings(mtn: MTNSettings): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                this.connectorSetting.mtn = mtn;
                this.save("Setting");
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
    public updateAirtelTigoSetting(airt: AirtelTigoSettings): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                this.connectorSetting.airteltigo = airt;
                this.save("Setting");
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
    public getSettings(connector: Connector): ConSettings {
        switch (connector) {
            case "MTN":
                return this.connectorSetting.mtn;
            case "AirtelTigo":
                return this.connectorSetting.airteltigo;
            default:
                return null;
        }
    }
}
