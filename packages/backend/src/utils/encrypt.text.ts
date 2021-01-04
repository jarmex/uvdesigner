//import * as crypto from "crypto";

//const keyString = "A03BED93281083A";
//const algorithm = "des-ecb";
//const iv = crypto.randomBytes(16);

export const encodeDesECB = (textToEncode: string) => {
    return textToEncode;
    /*  let keyv = crypto.createHash("sha256").update(String(keyString)).digest("base64").substr(0, 16);
    let key = Buffer.from(keyv, "binary");
    //    const key = Buffer.from(keyString.substring(0, 8), "hex");
    console.log(key);
    const cipher = crypto.createCipheriv(algorithm, key, "");
    // let c = cipher.update(textToEncode, "utf8", "hex");
    //c += cipher.final("hex");
    return ""; */
};

export const decodeDesECB = (text: string): string => {
    /*let key = crypto.createHash("sha256").update(String(keyString)).digest("base64").substr(0, 32);
    //    const key = Buffer.from(keyString.substring(0, 8), "hex");
    const deciper = crypto.createDecipheriv(algorithm, key, "");
    let c = deciper.update(text, "hex", "utf8");
    c += deciper.final("hex");
    return c;
    */
    return text;
};
