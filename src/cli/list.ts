import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { logger } from "src/logger";

const files = readdirSync(resolve(".", "src", "cli"));

logger.info(`available prompts:\n  ${files.map((file) => file.split(".")[0]).join("\n  ")}`, { label: "CLI::list" });
