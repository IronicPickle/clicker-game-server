import {
  APIGatewayProxyEventV2,
  Context,
} from "https://deno.land/x/lambda@1.25.2/mod.ts";
import { Doc } from "https://denopkg.com/chiefbiiko/dynamodb@master/mod.ts";
import sessionValidators from "../../../clicker-game-shared/validators/sessionValidators.ts";

import { dyno } from "../dynamo.ts";
import { error, ok, parseBody, parseValidators } from "../lib/utils/generic.ts";

export const TableName = "sessions";

export async function get(event: APIGatewayProxyEventV2, _context: Context) {
  const { id } = event.pathParameters ?? {};

  const validators = sessionValidators.get(event.pathParameters);
  const errors = parseValidators(validators);

  if (errors.failed || !id) return error(errors);

  let result: Doc;
  try {
    result = await dyno.getItem({
      TableName,
      Key: {
        id,
      },
    });
  } catch (err) {
    return error(`Could not fetch item\n${err}`);
  }

  if (!result.Item) return error(`Not Found: ${id}`, 404);

  return ok(result.Item);
}

export async function create(event: APIGatewayProxyEventV2, _context: Context) {
  const body = parseBody<{ displayName: string }>(event.body);
  const { displayName } = body ?? {};

  const validators = sessionValidators.create(body);
  const errors = parseValidators(validators);

  if (errors.failed || !displayName) return error(errors);

  const Item = {
    id: crypto.randomUUID(),
    displayName: displayName,
  };

  try {
    await dyno.putItem({
      TableName,
      Item,
    });
  } catch (err) {
    return error(`Could not put item\n${err}`);
  }

  return ok(Item);
}

export async function getAll(
  _event: APIGatewayProxyEventV2,
  _context: Context
) {
  let result: Doc;
  try {
    result = await dyno.scan({
      TableName,
    });
  } catch (err) {
    return error(`Could not fetch items\n${err}`);
  }

  if (!result.Items) return error(`Not Found`, 404);

  return ok(result.Items);
}
