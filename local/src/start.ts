import toggleDynamo from "../commands/toggleDynamo.ts";
import startEndpoint from "../commands/startEndpoint.ts";
import { apiPath, libPath, sharedPath } from "./constants.ts";
import { readKeypress } from "https://deno.land/x/keypress@0.0.8/mod.ts";
import * as path from "https://deno.land/std@0.57.0/path/mod.ts";

import endpoints from "./endpoints.ts";
import killEndpoint from "../commands/killEndpoint.ts";

const log = (...content: any[]) => console.log(...content, "\r");

const startAndWatch = async (endpoint: string, func: string, port: number) => {
  startEndpoint(endpoint, func, port);

  const watcher = Deno.watchFs([
    sharedPath,
    libPath,
    path.join(apiPath, `${endpoint}.ts`),
  ]);

  let lastUpdate = new Date();

  console.log(`> Starting endpoint: ${endpoint}.${func}`);

  for await (const _event of watcher) {
    if (new Date().getTime() - lastUpdate.getTime() < 5000) continue;
    lastUpdate = new Date();
    log(`> Reloading endpoint: ${endpoint}.${func}`);
    await killEndpoint(endpoint, func);
    startEndpoint(endpoint, func, port);
  }
};

const getWatchers = () => {
  const watchers: Array<Promise<void>> = [];
  for (const endpoint in endpoints) {
    const funcs = endpoints[endpoint];
    for (const func in funcs) {
      const port = funcs[func];

      watchers.push(startAndWatch(endpoint, func, port));
    }
  }

  return watchers;
};

const getKillers = () => {
  const killers: Array<Promise<void>> = [];
  for (const endpoint in endpoints) {
    const funcs = endpoints[endpoint];
    for (const func in funcs) {
      killers.push(killEndpoint(endpoint, func));
    }
  }

  return killers;
};

const awaitCtrlC = async () => {
  for await (const keypress of readKeypress()) {
    if (keypress.ctrlKey && keypress.key === "c") return;
  }
};

const start = async () => {
  log("\n> Starting DynamoDB");
  await toggleDynamo(true).status();

  log("\n> Starting endpoint");
  log(`> Listening for changes`);
  log("> Ctrl+C to kill watchers\n");
  await Promise.any([awaitCtrlC(), ...getWatchers()]);
  log("\nX Shutting down");

  log("\n> Killing Endpoints");
  await Promise.all(getKillers());

  log("\n> Stopping DynamoDB");
  await toggleDynamo(false).status();

  Deno.exit();
};

start();
