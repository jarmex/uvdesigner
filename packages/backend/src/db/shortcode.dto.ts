import { v4 } from "uuid";

export class ShortCodeData {
    serviceId: string;
    mapKey: string;
    description: string;

    constructor(shortcode: string, description: string) {
        const id = v4().replace(/\-/g, "");
        this.serviceId = id;
        this.mapKey = shortcode;
        this.description = description;
    }
}
