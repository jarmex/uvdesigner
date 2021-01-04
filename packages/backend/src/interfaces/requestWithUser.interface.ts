import { AccountData } from "db/account.dto";
import { Request } from "express";

interface RequestWithAccount extends Request {
    account: AccountData;
}

export default RequestWithAccount;
