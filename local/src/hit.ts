import hitEndpoint from "../commands/hitEndpoint.ts";
import { outputPath, payloadPath } from "./constants.ts";

const start = async () => {
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

  await hitEndpoint(payload).status();

  const { statusCode, body } = JSON.parse(await Deno.readTextFile(outputPath));

  console.log(
    "response.json",
    `\nStatus: ${statusCode}`,
    "\nBody:",
    JSON.parse(body)
  );
};

start();
