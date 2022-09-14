import startEndpoint from "../commands/startEndpoint.ts";
import toggleDynamo from "../commands/toggleDynamo.ts";

const start = async () => {
  const endpoint = prompt("Endpoint name:");
  const func = prompt("Function name:");

  await toggleDynamo(true).status();

  await startEndpoint(`${endpoint}.${func}`).status();

  await toggleDynamo(false).status();
};

start();
