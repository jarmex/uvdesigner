//import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, IsUrl } from "class-validator";

export class MTNServicesDto {
    @IsString()
    public spId: string;
    @IsString()
    public serviceId: string;
    @IsString()
    public activationNumber: string;
    @IsString()
    public correlator: string;
}
export class MTNServices {
    spId: string;
    serviceId: string;
    activationNumber: string;
    correlator: string;
}

export class MtnSettingsDto {
    @IsString()
    public spPassword: string;
    @IsString()
    timeStamp: string;
    @IsString()
    endpoint: string;
    @IsArray()
    //@Type(() => MTNServices)
    services: Array<MTNServices>;
    @IsNumber()
    timeout: number;
    @IsUrl()
    baseUrl: string;
}

export class MTNSettings {
    spPassword: string;
    timeStamp: string;
    endpoint: string;
    services: Array<MTNServices>;
    timeout: number;
    baseUrl: string;
    constructor(
        spPassword: string,
        timeStamp: string,
        endpoint: string,
        services: MTNServices[],
        timeOut: number,
        baseUrl: string
    ) {
        this.spPassword = spPassword;
        this.timeStamp = timeStamp;
        this.endpoint = endpoint;
        this.services = services;
        this.timeout = timeOut;
        this.baseUrl = baseUrl;
    }
}

export class AirtelTigoSettingsDto {
    @IsString()
    baseUrl: string;
}
export class AirtelTigoSettings {
    baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
}

export class ConnectorSettings {
    mtn: MTNSettings;
    airteltigo: AirtelTigoSettings;
}
