import { ShortCodeData } from "./shortcode.dto";
import { plainToClass } from "class-transformer";
import { decodeDesECB, encodeDesECB } from "../utils/encrypt.text";
import { getLogger, Logger } from "../utils";
import { AsyncRedis } from "../shared/AsyncRedis";
import Environment from "../shared/environment";

export class ShortCodeDb {
    private db: Array<ShortCodeData> = new Array<ShortCodeData>();
    private log: Logger;
    private redis: AsyncRedis;

    constructor() {
        this.log = getLogger("shortcode");
        this.redis = new AsyncRedis({ prefix: "uvd-sh:", ...Environment.redis });
    }

    public async readAllShortcodes() {
        try {
            const data = await this.redis.getAsync("shortcodes");
            if (!data) return;
            const allAccount = JSON.parse(data.toString("utf8"));
            if (Array.isArray(allAccount)) {
                this.db = plainToClass(ShortCodeData, allAccount);
            }
        } catch (error) {
            this.log.error(error.message);
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

    private async save() {
        try {
            await this.redis.setAsync("shortcodes", JSON.stringify(this.db));
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }

    /**
     * Update the UVD designer data using the serviceId as key
     *
     * @param {string} serviceId
     * @param {any} data
     * @returns {Promise<void>}
     */
    public async updateServiceId(serviceId: string, data: any): Promise<void> {
        if (!serviceId) throw new Error("Service ID is not valid");
        await this.redis.setAsync(serviceId, JSON.stringify(data));
    }

    /**
     * Get the UVD designer data stored in the redis database
     *
     * @param {string} serviceId
     * @returns {Promise<any>}
     */
    public async getServiceIdData(serviceId: string): Promise<any> {
        if (!serviceId) throw new Error("Service ID is not valid");
        try {
            const result = await this.redis.getAsync(serviceId);
            if (result) {
                return JSON.parse(result);
            }
            return undefined;
        } catch (error) {
            throw error;
        }
    }

    public getAllShortCodes(): Promise<Array<ShortCodeData>> {
        return new Promise(resolve =>
            resolve(
                this.db.map(sc => {
                    sc.mapKey = decodeDesECB(sc.mapKey);
                    return sc;
                })
            )
        );
    }

    public async createShortCode(shortcode: string, description: string): Promise<ShortCodeData> {
        try {
            const encryptShortcode = encodeDesECB(shortcode);
            // ensure the shortcode is not already defined
            const isExist = this.db.find(t => t.mapKey === encryptShortcode);
            if (isExist) {
                throw new Error("Short code already exist");
            }
            const newShortCode = new ShortCodeData(encryptShortcode, description);
            this.db.push(newShortCode);
            await this.save();
            // revert back
            newShortCode.mapKey = shortcode;
            return newShortCode;
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }

    public async removeShortCode(serviceId: string): Promise<ShortCodeData> {
        const idx = this.db.findIndex(h => h.serviceId === serviceId);
        if (idx === -1) {
            throw new Error("The service Id does not exist");
        } else {
            try {
                const scd = this.db[idx];
                this.db.splice(idx, 1);
                await this.save();
                return scd;
            } catch (error) {
                this.log.error(error.message);
                throw error;
            }
        }
    }

    public async updateShortCode(serviceId: string, shortcode: string, desc: string): Promise<void> {
        const idx = this.db.findIndex(h => h.serviceId === serviceId);
        if (idx === -1) {
            throw new Error("The service Id does not exist");
        } else {
            this.db[idx].mapKey = encodeDesECB(shortcode);
            this.db[idx].description = desc;
            try {
                await this.save();
            } catch (error) {
                this.log.error(error.message);
                throw error;
            }
        }
    }
}
