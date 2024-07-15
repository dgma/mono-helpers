import { HttpsProxyAgent } from "hpagent";
import conf from "src/conf";

let agent: HttpsProxyAgent;

export function getProxyAgent(update = false) {
  if (agent === undefined || update) {
    agent = new HttpsProxyAgent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxSockets: 256,
      maxFreeSockets: 256,
      proxy: getURI(),
      rejectUnauthorized: false,
    });
  }
  return agent;
}

export function refreshProxyAgent() {
  agent.destroy();
  return getProxyAgent(true);
}

export function getURI() {
  const { user, pass, host, port } = conf.proxy;
  return `http://${user}:${pass}@${host}:${port}`;
}
