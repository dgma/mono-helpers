import * as dotenv from "dotenv";
const config = dotenv.config({ path: "./.env.local" });

const getEnv = (prop: string) => config?.parsed?.[prop] || process.env[prop];

export default getEnv;
