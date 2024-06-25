import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const files = readdirSync(resolve(".", "src", "cli"));

console.log(`available commands:\n  ${files.map((file) => file.split(".")[0]).join("\n  ")}`);
