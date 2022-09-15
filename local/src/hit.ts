import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import hitEndpoint from "../commands/hitEndpoint.ts";
import { dirname } from "./constants.ts";

const start = async () => {
  const endpoint = prompt("Endpoint name:");
  const func = prompt("Function name:");
  let payload = null;

  try {
    await Deno.remove(path.join(dirname, "../output.json"));
  } catch (_err) {}

  try {
    payload = JSON.parse(
      await Deno.readTextFile(path.join(dirname, "../payload.json"))
    );
  } catch (_err) {
    const string = prompt("No payload.json found, taking terminal input:");
    if (string) payload = JSON.parse(string);
  }

  await hitEndpoint(`${endpoint}.${func}`, payload).status();

  const output = JSON.parse(
    await Deno.readTextFile(path.join(dirname, "../output.json"))
  );

  console.log("Output\n", output);
};

start();
