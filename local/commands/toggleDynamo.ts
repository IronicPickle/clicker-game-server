import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import { dirname } from "../src/constants.ts";

export default (up: boolean) =>
  Deno.run({
    cmd: ["docker", "compose", ...(up ? ["up", "-d"] : ["down"])],
    cwd: path.join(dirname, "../docker-dynamo"),
  });
