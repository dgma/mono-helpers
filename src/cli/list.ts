import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const files = readdirSync(resolve(".", "src", "prompts"));

console.log(`available prompts:\n  ${files.map((file) => file.split(".")[0]).join("\n  ")}`);
