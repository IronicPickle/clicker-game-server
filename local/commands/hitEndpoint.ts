import { basePath, outputPath } from "../src/constants.ts";

export default (data: any) =>
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
      "null",
      "--payload",
      JSON.stringify(data),
      outputPath,
    ],
    cwd: basePath,
  });
