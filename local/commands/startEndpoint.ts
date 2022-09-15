import { basePath, layerPath, srcPath } from "../src/constants.ts";

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
      "--add-host",
      "host.docker.internal:host-gateway",

      "--mount",
      `type=bind,source=${srcPath},destination=/var/task,readonly`,

      "--mount",
      `type=bind,source=${layerPath},destination=/opt,readonly`,

      "lambci/lambda:provided.al2",
      `api/${endpoint}`,
    ],
    cwd: basePath,
  });
