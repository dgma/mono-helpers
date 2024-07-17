import { HttpsProxyAgent } from "hpagent";
import { getAppConf } from "src/libs/configs";

let agent: HttpsProxyAgent;

export async function getProxyAgent(update = false) {
  if (agent === undefined || update) {
    agent = new HttpsProxyAgent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxSockets: 256,
      maxFreeSockets: 256,
      proxy: await getURI(),
      rejectUnauthorized: false,
    });
  }
  return agent;
}

export function refreshProxyAgent() {
  agent.destroy();
  return getProxyAgent(true);
}

export async function getURI() {
  const { proxy } = await getAppConf();
  return `http://${proxy.userᵻ}:${proxy.passᵻ}@${proxy.hostᵻ}:${proxy.portᵻ}`;
}
