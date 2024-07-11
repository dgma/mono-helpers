export const sleep = (time: number = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export const getRandomArbitrary = (min: number, max: number) => {
  if (max <= min) {
    throw new Error("max should be above min");
  }
  return Math.random() * (max - min) + min;
};
