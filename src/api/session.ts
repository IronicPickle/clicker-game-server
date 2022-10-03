import {
  APIGatewayProxyEventV2,
  Context,
} from "https://deno.land/x/lambda@1.25.2/mod.ts";
import {
  CreateSessionReq,
  GetSessionReq,
} from "../../../clicker-game-shared/ts/api/session.ts";
import sessionValidators from "../../../clicker-game-shared/validators/sessionValidators.ts";

import DynoTable from "../lib/utils/DynoTable.ts";
import {
  error,
  ok,
  parseBody,
  parseParams,
  parseValidators,
} from "../lib/utils/generic.ts";

const Sessions = new DynoTable("sessions");

export async function get(event: APIGatewayProxyEventV2, _context: Context) {
  const params = parseParams<GetSessionReq>(event);

  const validators = sessionValidators.get(params);
  const errors = parseValidators(validators);

  const { id } = params;

  if (errors.failed || !id) return error(errors);

  const { err, data } = await Sessions.getItemById(id);
  if (err || !data) return error(`Could not fetch item. ${err}`);
  const { Item } = data;

  if (!Item) return error(`Not Found: ${id}`, 404);

  return ok(Item);
}

export async function create(event: APIGatewayProxyEventV2, _context: Context) {
  const body = parseBody<CreateSessionReq>(event);

  const validators = sessionValidators.create(body);
  const errors = parseValidators(validators);

  const { displayName } = body;

  if (errors.failed || !displayName) return error(errors);

  const Item = {
    id: crypto.randomUUID(),
    displayName: displayName,
  };

  const { err } = await Sessions.putItem(Item);
  if (err) return error(`Could not put item. ${err}`);

  return ok(Item);
}

export async function getAll(
  _event: APIGatewayProxyEventV2,
  _context: Context
) {
  const { err, data } = await Sessions.scan();
  if (err || !data) return error(`Could not fetch items. ${err}`);
  const { Items } = data;

  if (!Items) return error(`Not Found`, 404);

  return ok(Items);
}
