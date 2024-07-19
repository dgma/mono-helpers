import { initiateMinting } from "src/core/scroll/canvas";

(async function main() {
  console.log("scroll canvas script initiated");
  await initiateMinting();
  console.log("scroll canvas script finished");
})();
