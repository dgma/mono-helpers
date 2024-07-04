let time = Date.now();

export function markTime() {
  time = Date.now();
}

export function currentTime() {
  return time;
}
