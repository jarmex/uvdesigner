import { ShortCodeData } from "./shortcode.dto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { plainToClass } from "class-transformer";
import { join, dirname } from "path";
import { decodeDesECB, encodeDesECB } from "../utils/encrypt.text";
import { getLogger, Logger } from "../utils";

export class ShortCodeDb {
    private filepath: string;
    private db: Array<ShortCodeData> = new Array<ShortCodeData>();
    private log: Logger;
    constructor() {
        this.log = getLogger("shortcode");
        const filename: string = "shortcodes.json";
        this.filepath = this.getFilePath(filename);

        this.readFileContent();
    }

    private getFilePath(filename: string): string {
        const fpath = join(process.cwd(), "accounts", filename);
        return fpath;
    }

    private readFileContent() {
        try {
            if (!existsSync(this.filepath)) {
                this.log.warn("No shortcode defined");
                return;
            }
            const data = readFileSync(this.filepath);
            const allAccount = JSON.parse(data.toString("utf8"));
            if (Array.isArray(allAccount)) {
                this.db = plainToClass(ShortCodeData, allAccount);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public getShortCode(serviceId: string): Promise<ShortCodeData | undefined> {
        return new Promise(resolve => {
            const d = this.db.find(h => h.serviceId === serviceId);
            if (d) {
                d.mapKey = decodeDesECB(d.mapKey);
                resolve(d);
            } else {
                resolve(undefined);
            }
        });
    }

    private save() {
        try {
            const dir = dirname(this.filepath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            writeFileSync(this.filepath, JSON.stringify(this.db));
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    public getAllShortCodes(): Promise<Array<ShortCodeData>> {
        return new Promise(r =>
            r(
                this.db.map(sc => {
                    sc.mapKey = decodeDesECB(sc.mapKey);
                    return sc;
                })
            )
        );
    }

    public createShortCode(shortcode: string, description: string): Promise<ShortCodeData> {
        return new Promise((resolve, reject) => {
            try {
                const encryptShortcode = encodeDesECB(shortcode);
                // ensure the shortcode is not already defined
                const isExist = this.db.find(t => t.mapKey === encryptShortcode);
                if (isExist) {
                    reject(new Error("Short code already exist"));
                    return;
                }
                const newShortCode = new ShortCodeData(encryptShortcode, description);
                this.db.push(newShortCode);
                this.save();
                // revert back
                newShortCode.mapKey = shortcode;
                resolve(newShortCode);
            } catch (error) {
                reject(error);
            }
        });
    }

    public removeShortCode(serviceId: string): Promise<ShortCodeData> {
        return new Promise((resolve, reject) => {
            const idx = this.db.findIndex(h => h.serviceId === serviceId);
            if (idx === -1) {
                reject(new Error("The service Id does not exist"));
            } else {
                try {
                    const scd = this.db[idx];
                    this.db.splice(idx, 1);
                    this.save();
                    resolve(scd);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    public updateShortCode(serviceId: string, shortcode: string, desc: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const idx = this.db.findIndex(h => h.serviceId === serviceId);
            if (idx === -1) {
                reject(new Error("The service Id does not exist"));
            } else {
                this.db[idx].mapKey = encodeDesECB(shortcode);
                this.db[idx].description = desc;
                try {
                    this.save();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
}
