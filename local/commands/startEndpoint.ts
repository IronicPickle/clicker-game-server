import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import { dirname } from "../src/constants.ts";

export default (endpoint: string) =>
  Deno.run({
    cmd: [
      "docker",
      "run",
      "-it",
      "--rm",
      "-e",
      "AWS_REGION=local",
      "-e",
      "DYNAMO_HOSTNAME=host.docker.internal",
      "-e",
      "DYNAMO_PORT=8000",
      "-e",
      "AWS_ACCESS_KEY_ID=null",
      "-e",
      "AWS_SECRET_ACCESS_KEY=null",
      "-e",
      "DOCKER_LAMBDA_STAY_OPEN=1",
      "-p",
      "9001:9001",

      "--mount",
      `type=bind,source=${path.join(
        dirname,
        "../../src"
      )},destination=/var/task,readonly`,

      "--mount",
      `type=bind,source=${path.join(
        dirname,
        "../deno-lambda-layer"
      )},destination=/opt,readonly`,

      "lambci/lambda:provided.al2",
      `api/${endpoint}`,
    ],
    cwd: path.join(dirname, "../../"),
  });
