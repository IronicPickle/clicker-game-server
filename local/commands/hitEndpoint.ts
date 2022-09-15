import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import { dirname } from "../src/constants.ts";

export default (endpoint: string, data: any) =>
  Deno.run({
    cmd: [
      "aws",
      "lambda",
      "invoke",
      "--endpoint",
      "http://localhost:9001",
      "--no-sign-request",
      "--cli-binary-format",
      "raw-in-base64-out",
      "--region",
      "local",
      "--function-name",
      endpoint,
      "--payload",
      JSON.stringify(data),
      path.join(dirname, "../output.json"),
    ],
    cwd: path.join(dirname, "../../"),
  });
