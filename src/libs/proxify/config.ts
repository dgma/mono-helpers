import getEnv from "src/env";

export default function config() {
  return {
    username: getEnv("PROXY_USER") as string,
    password: getEnv("PROXY_PASS") as string,
    host: getEnv("PROXY_HOST") as string,
    port: getEnv("PROXY_PORT") as string,
    rebootURL: getEnv("PROXY_REBOOT") as string,
  };
}
