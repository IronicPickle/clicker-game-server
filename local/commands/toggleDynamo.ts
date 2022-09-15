import { dynamoPath } from "../src/constants.ts";

export default (up: boolean) =>
  Deno.run({
    cmd: ["docker", "compose", ...(up ? ["up", "-d"] : ["down"])],
    cwd: dynamoPath,
  });
