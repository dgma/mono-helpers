import { sleep } from "src/libs/shared";
import { logger } from "src/logger";
export default class Clock {
  #time = Date.now();

  markTime() {
    this.#time = Date.now();
  }

  currentTime() {
    return this.#time;
  }

  timePassed() {
    return Date.now() - this.#time;
  }

  async sleepMax(maxSleep: number) {
    const waitTime = maxSleep - this.timePassed();
    logger.info(`wait ${waitTime}`, { label: "Clock" });
    await sleep(waitTime);
  }
}
