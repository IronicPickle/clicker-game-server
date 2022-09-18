import { basePath, layerPath, rootPath } from "../src/constants.ts";

export default (endpoint: string, func: string, port: number) =>
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
      `${port}:9001`,
      "--add-host",
      "host.docker.internal:host-gateway",

      "--name",
      `${endpoint}.${func}`,

      "--mount",
      `type=bind,source=${rootPath},destination=/var/task,readonly`,

      "--mount",
      `type=bind,source=${layerPath},destination=/opt,readonly`,

      "lambci/lambda:provided.al2",
      `clicker-game-server/src/api/${endpoint}.${func}`,
    ],
    cwd: basePath,
  });
