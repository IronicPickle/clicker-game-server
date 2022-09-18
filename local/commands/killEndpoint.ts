import { basePath } from "../src/constants.ts";

export default async (endpoint: string, func: string) => {
  const output = await Deno.run({
    cmd: ["docker", "ps", "-a", "-q", "--filter", `name=^${endpoint}.${func}$`],
    cwd: basePath,
    stdout: "piped",
    stderr: "piped",
  }).output();

  const container = new TextDecoder().decode(output).replace(/\n/g, "");

  if (!container) return;
  await Deno.run({
    cmd: ["docker", "stop", container],
    cwd: basePath,
    stdout: "piped",
    stderr: "piped",
  }).status();
};
