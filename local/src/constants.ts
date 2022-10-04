import { path } from "./deps.ts";

export const dirname = decodeURIComponent(
  path.dirname(path.fromFileUrl(import.meta.url))
);

export const rootPath = path.join(dirname, "../../../");
export const sharedPath = path.join(rootPath, "clicker-game-shared");
export const basePath = path.join(rootPath, "clicker-game-server");
export const srcPath = path.join(basePath, "src");
export const localPath = path.join(basePath, "local");

export const apiPath = path.join(srcPath, "api");
export const libPath = path.join(srcPath, "lib");

export const outputPath = path.join(localPath, "response.json");
export const payloadPath = path.join(localPath, "payload.json");
export const layerPath = path.join(localPath, "deno-lambda-layer");
export const dynamoPath = path.join(localPath, "docker-dynamo");
