export const sleep = (time: number = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });
