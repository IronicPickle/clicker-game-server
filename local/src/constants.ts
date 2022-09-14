import * as path from "https://deno.land/std@0.57.0/path/mod.ts";

export const dirname = decodeURIComponent(
  path.dirname(path.fromFileUrl(import.meta.url))
);
