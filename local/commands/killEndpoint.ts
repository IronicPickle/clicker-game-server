import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import { dirname } from "../src/constants.ts";

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
    cwd: path.join(dirname, "../../"),
    stdout: "piped",
    stderr: "piped",
  }).output();

  const container = new TextDecoder().decode(output).replace(/\n/g, "");

  if (!container) return;
  await Deno.run({
    cmd: ["docker", "stop", container],
    cwd: path.join(dirname, "../../"),
  }).status();
};
