import * as path from "https://deno.land/std@0.57.0/path/mod.ts";

export const dirname = decodeURIComponent(
  path.dirname(path.fromFileUrl(import.meta.url))
);

export const basePath = path.join(dirname, "../../");
export const srcPath = path.join(basePath, "src");
export const localPath = path.join(basePath, "local");

export const outputPath = path.join(localPath, "response.json");
export const payloadPath = path.join(localPath, "payload.json");
export const layerPath = path.join(localPath, "deno-lambda-layer");
export const dynamoPath = path.join(localPath, "docker-dynamo");
