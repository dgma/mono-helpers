import * as chains from "viem/chains";
import { logger } from "src/logger";

const chain = chains.scroll;

logger.debug(chain.id);
