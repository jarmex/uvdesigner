import { plainToClass } from "class-transformer";
import { AccountData } from "./account.dto";
import { v4 } from "uuid";
import { getLogger, Logger } from "../utils";
import { AirtelTigoSettings, MTNSettings } from "./settings.dto";
import { Connector } from "@uvdesigner/common";
import { AsyncRedis } from "../shared/AsyncRedis";
import Environment from "../shared/environment";

type ConSettings = MTNSettings | AirtelTigoSettings | null;

export class AccountDatabase {
    private log: Logger;
    private redis: AsyncRedis;

    constructor() {
        this.redis = new AsyncRedis({ prefix: "acnt:", ...Environment.redis });
        this.log = getLogger("account");
    }

    private async save(key: string, data: any) {
        try {
            await this.redis.setAsync(key, JSON.stringify(data));
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }

    public async addAccount(username: string, password: string): Promise<AccountData> {
        if (!username) throw new Error("Invalid username");
        try {
            const key = `user-${username}`;
            const userData = await this.redis.getAsync(key);
            if (userData) {
                throw new Error("User already exist");
            }
            const acnt: AccountData = new AccountData();

            acnt.id = v4();
            acnt.createdDate = new Date().toString();
            acnt.username = username;
            acnt.password = password;
            this.save(key, acnt);
            return acnt;
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }

    public async setTempAccount(createdBy: string): Promise<boolean> {
        try {
            const isTempSet = await this.redis.getAsync("temp-account");
            if (isTempSet) {
                return false;
            }
            await this.redis.setAsync("temp-account", createdBy);
            return true;
        } catch (error) {
            throw error;
        }
    }

    public async getTempCreatedBy(): Promise<string> {
        return this.redis.getAsync("temp-account");
    }
    public async changeTempAccount(value: string): Promise<void> {
        await this.redis.setAsync("temp-account", value);
    }

    public async getAccount(username: string): Promise<AccountData | null> {
        const key = `user-${username}`;
        try {
            const data = await this.redis.getAsync(key);
            if (!data) return null;
            return plainToClass(AccountData, JSON.parse(data.toString("utf8")));
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }

    public async removeAccount(username: string): Promise<AccountData> {
        try {
            const key = `user-${username}`;
            const data = await this.redis.getAsync(key);
            if (!data) throw new Error("User does not exist");
            await this.redis.delAsync(key);
            return plainToClass(AccountData, JSON.parse(data.toString("utf8")));
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }

    public async updateAccount(username: string, updateAcnt: AccountData): Promise<boolean> {
        try {
            const key = `user-${username}`;
            const isUserExist = await this.redis.getAsync(key);
            if (!isUserExist) return false;
            await this.redis.setAsync(key, JSON.stringify(updateAcnt));
            return true;
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }
    public async updateMtnSettings(mtn: MTNSettings): Promise<boolean> {
        try {
            if (!mtn) throw new Error("Invalid settings");
            await this.redis.setAsync("mtn-settings", JSON.stringify(mtn));
            return true;
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }
    public async updateAirtelTigoSetting(airt: AirtelTigoSettings): Promise<boolean> {
        try {
            if (!airt) throw new Error("Invalid settings");
            await this.redis.setAsync("airteltigo-settings", JSON.stringify(airt));
            return true;
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }
    public async getSettings(connector: Connector): Promise<ConSettings> {
        try {
            const key = "mtn-settings";
            const data = await this.redis.getAsync(key);
            if (!data) throw new Error("No setting found for MTN");
            switch (connector) {
                case "MTN":
                    return plainToClass(MTNSettings, JSON.parse(data.toString("utf8")));
                case "AirtelTigo":
                    return plainToClass(AirtelTigoSettings, JSON.parse(data.toString("utf8")));
                default:
                    return null;
            }
        } catch (error) {
            this.log.error(error.message);
            throw error;
        }
    }
}
