import * as dotenv from "dotenv";
const config = dotenv.config({ path: "./.env" });

const getEnv = (prop: string) => {
  const value = config?.parsed?.[prop] || process.env[prop];
  if ((typeof value === "string" && !value?.length) || (typeof value === "number" && isNaN(value)) || !value) {
    throw new Error(`value for ${prop} is not set`);
  }
  return value;
};

export default getEnv;
