import { createClient } from "../../deps.ts";

const host = Deno.env.get("DYNAMO_HOSTNAME");
const port = Deno.env.get("DYNAMO_PORT");

export const dyno = createClient({
  host,
  port: port ? +port : undefined,
});
