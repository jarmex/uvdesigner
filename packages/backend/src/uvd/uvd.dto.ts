import { IsString } from "class-validator";

export class ShortCodeDto {
    @IsString()
    mapKey: string;
    @IsString()
    description: string;
}
