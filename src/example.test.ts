import { example } from "./example";

describe("example", () => {
  it("should log hello world", () => {
    expect(example()).toBe("Hello world");
  });
});
