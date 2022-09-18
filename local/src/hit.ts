import hitEndpoint from "../commands/hitEndpoint.ts";
import { outputPath, payloadPath } from "./constants.ts";
import endpoints from "./endpoints.ts";

const start = async () => {
  const endpoint = prompt("- Endpoint name\n>");
  const func = prompt("- Function name\n>");
  if (!endpoint || !func) return;

  const port = endpoints[endpoint][func];
  if (port == null) return;

  console.log("\n");

  console.clear();

  let payload = null;

  try {
    await Deno.remove(outputPath);
  } catch (_err) {}

  try {
    payload = JSON.parse(await Deno.readTextFile(payloadPath));
  } catch (_err) {
    const string = prompt("No payload.json found, taking terminal input:");
    if (string) payload = JSON.parse(string);
  }

  await hitEndpoint(payload, endpoint, func, port).status();

  const { statusCode, body } = JSON.parse(await Deno.readTextFile(outputPath));

  console.log(
    "response.json",
    `\nStatus: ${statusCode}`,
    "\nBody:",
    body ? JSON.parse(body) : body
  );
};

start();
