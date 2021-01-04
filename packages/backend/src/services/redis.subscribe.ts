import { AsyncRedis } from "../shared/AsyncRedis";
import Environment from "../shared/environment";
import { RequestType, Constants, ISubMessage } from "../utils/constants";
import MTNOpenSession from "./mtn.opensession";

class RedisSubscribe {
    redis: AsyncRedis;
    private mtn: MTNOpenSession;
    constructor() {
        this.redis = new AsyncRedis({
            port: Environment.redis.port,
            host: Environment.redis.host,
        });
        this.startListening();
        this.mtn = new MTNOpenSession();
    }
    private startListening() {
        this.redis.subscribe(Constants.RedPublishKey);
        this.redis.on("message", async (_, message: string) => {
            // process the message here
            this.processMessage(message);
        });
    }

    private async processMessage(message: string) {
        if (!message) return;
        // parse the message
        const msg = <ISubMessage>JSON.parse(message);
        // check for the type:
        switch (msg.requestType) {
            case RequestType.MTN_notifyUssdReception:
                if (msg.msgType === 0) {
                    await this.mtn.onOpenUssdSession(msg);
                } else {
                    await this.mtn.onSendRequest(msg);
                }
                break;
            case RequestType.MTN_notifyUSSDAbort:
                await this.mtn.onCloseSession(msg);
                break;
            default:
                break;
        }
    }
}

export default RedisSubscribe;
