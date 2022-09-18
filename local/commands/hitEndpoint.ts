import { basePath, outputPath } from "../src/constants.ts";

export default (data: any, endpoint: string, func: string, port: number) =>
  Deno.run({
    cmd: [
      "aws",
      "lambda",
      "invoke",
      "--endpoint",
      `http://localhost:${port}`,
      "--no-sign-request",
      "--cli-binary-format",
      "raw-in-base64-out",
      "--region",
      "local",
      "--function-name",
      `${endpoint}.${func}`,
      "--payload",
      JSON.stringify(data),
      outputPath,
    ],
    cwd: basePath,
  });
