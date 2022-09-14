import startEndpoint from "../commands/startEndpoint.ts";
import toggleDynamo from "../commands/toggleDynamo.ts";
import { readKeypress } from "https://deno.land/x/keypress@0.0.8/mod.ts";
import killEndpoint from "../commands/killEndpoint.ts";

const awaitCtrlR = async () => {
  for await (const keypress of readKeypress()) {
    if (keypress.ctrlKey) {
      if (keypress.key === "r") return false;
      if (keypress.key === "c") return true;
    }
  }
  return true;
};

const killAndStart = async (endpoint: string, func: string) => {
  await killEndpoint();
  const process = await startEndpoint(`${endpoint}.${func}`).status();

  return !process.success;
};

const start = async () => {
  const endpoint = prompt("Endpoint name:");
  const func = prompt("Function name:");

  if (!endpoint || !func) return;

  await toggleDynamo(true).status();

  while (true) {
    const killProcess = await Promise.any([
      awaitCtrlR(),
      killAndStart(endpoint, func),
    ]);
    if (killProcess) break;
  }

  await toggleDynamo(false).status();
};

start();
