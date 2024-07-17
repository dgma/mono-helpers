import { sleep } from "src/libs/shared";
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
    console.log(`wait ${waitTime}`);
    await sleep(waitTime);
  }
}
