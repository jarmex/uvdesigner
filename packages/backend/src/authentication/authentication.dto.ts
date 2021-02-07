import { IsString, IsNotEmpty } from "class-validator";

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    public username: string;
    @IsString()
    @IsNotEmpty()
    public password: string;
    @IsString()
    @IsNotEmpty()
    public id: string;
    @IsString()
    public createdBy: string;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    public username: string;
    @IsString()
    @IsNotEmpty()
    public password: string;
}

export interface TokenData {
    token: string;
    expiresIn: number;
}

export interface DataStoredInToken {
    username: string;
}
