import { IsString } from "class-validator";

export class AccountDto {
    @IsString()
    public id: string;
    @IsString()
    public username: string;
    @IsString()
    public password: string;
    @IsString()
    public createdDate: string;
}

export class AccountData {
    id: string;
    username: string;
    password: string;
    createdDate: string;
}
