import { config } from "dotenv";

config({ path: "../../config/.env" });

const toCamelCase = (strkey: string) => {
  const str = strkey.replace(/^REDIS_/g, "");
  const replacer = (match: string, p1: string, p2: string) => {
    if (p2) {
      return p2.toUpperCase();
    }
    return p1.toLowerCase();
  };
  return str.replace(/^([A-Z])|[\s-_](\w)/g, replacer);
};

export interface IRedisConfig {
  [key: string]: any;
}

export const getRedisConfig = () => {
  const regex = /^REDIS_.+/;

  const envKeys = Object.keys(process.env)
    .filter((item) => regex.test(item))
    .map((item) => ({
      [toCamelCase(item)]: process.env[item],
    }));
  return { ...envKeys };
};
