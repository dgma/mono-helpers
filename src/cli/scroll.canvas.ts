import { initiateMinting } from "src/core/scroll/canvas";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::canvas" });
  await initiateMinting();
  logger.info("finished", { label: "CLI::canvas" });
})();
