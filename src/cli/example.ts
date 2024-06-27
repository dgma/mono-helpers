import { input } from "@inquirer/prompts";

// eslint-disable-next-line promise/catch-or-return
input({ message: "Enter your name" }).then((answer) => {
  console.log("execute test cli command with", answer);
  return;
});
