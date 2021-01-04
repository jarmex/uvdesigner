import { promisify } from "util";
import { RedisClient } from "redis";

export class AsyncRedis extends RedisClient {
    public readonly getAsync = promisify(this.get).bind(this);
    public readonly setAsync = promisify(this.set).bind(this);
    public readonly quitAsync = promisify(this.quit).bind(this);
    public readonly setExAsync = promisify(this.setex).bind(this);
    // public readonly delAsync = promisify(this.del).bind(this);
    public readonly rpushAsync: (list: string, item: string) => Promise<number> = promisify(this.rpush).bind(this);
    public readonly blpopAsync: (list: string, timeout: number) => Promise<[string, string]> = promisify(
        this.blpop
    ).bind(this);
    public readonly flushdbAsync = promisify(this.flushdb).bind(this);
    public readonly delAsync = (key: string) =>
        new Promise((resolve, reject) => {
            this.del(key, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
}
