import {
  CreateSessionReq,
  GetSessionReq,
} from "../../../clicker-game-shared/ts/api/session.ts";
import sessionValidators from "../../../clicker-game-shared/validators/sessionValidators.ts";
import { APIGatewayProxyEventV2, Context } from "../deps.ts";
import DynoTable from "../lib/utils/DynoTable.ts";
import {
  error,
  notFoundError,
  ok,
  parseBody,
  parseParams,
  parseValidators,
  validationError,
} from "../lib/utils/generic.ts";

const Sessions = new DynoTable("sessions");

export async function get(event: APIGatewayProxyEventV2, _context: Context) {
  const params = parseParams<GetSessionReq>(event);

  const validators = sessionValidators.get(params);
  const validation = parseValidators(validators);

  const { id } = params;

  if (validation.failed || !id) return validationError(validation);

  const { err, data } = await Sessions.getItemById(id);
  if (err || !data) return error(`Could not fetch item. ${err}`);
  const { Item } = data;

  if (!Item) return notFoundError(`Not Found: ${id}`);

  return ok(Item);
}

export async function create(event: APIGatewayProxyEventV2, _context: Context) {
  const body = parseBody<CreateSessionReq>(event);

  const validators = sessionValidators.create(body);
  const validation = parseValidators(validators);

  const { displayName } = body;

  if (validation.failed || !displayName) return validationError(validation);

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

  if (!Items) return notFoundError(`Not Found`);

  return ok(Items);
}
