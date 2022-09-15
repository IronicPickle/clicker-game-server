import { basePath } from "../src/constants.ts";

export default async () => {
  const output = await Deno.run({
    cmd: [
      "docker",
      "ps",
      "-a",
      "-q",
      "--filter",
      "ancestor=lambci/lambda:provided.al2",
    ],
    cwd: basePath,
    stdout: "piped",
    stderr: "piped",
  }).output();

  const container = new TextDecoder().decode(output).replace(/\n/g, "");

  if (!container) return;
  await Deno.run({
    cmd: ["docker", "stop", container],
    cwd: basePath,
  }).status();
};
