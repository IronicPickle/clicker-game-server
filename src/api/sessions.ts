import {
  APIGatewayProxyEventV2,
  Context,
} from "https://deno.land/x/lambda@1.25.2/mod.ts";
import { Doc } from "https://denopkg.com/chiefbiiko/dynamodb@master/mod.ts";

import { dyno } from "../dynamo.ts";
import { error, generateUuid, ok, parseBody } from "../lib/utils/generic.ts";
import Validator from "../lib/utils/Validator.ts";

export const TableName = "sessions";

export async function get(event: APIGatewayProxyEventV2, _context: Context) {
  const { id } = event.pathParameters ?? {};
  if (id == null) return error(`'id' is required in params`);

  let result: Doc;
  try {
    result = await dyno.getItem({
      TableName,
      Key: {
        id: id,
      },
    });
  } catch (err) {
    return error(`Could not fetch item\n${err}`);
  }

  if (!result.Item) return error(`Not Found: ${id}`, 404);

  return ok(result.Item);
}

export async function create(event: APIGatewayProxyEventV2, _context: Context) {
  const { displayName } = parseBody(event.body) ?? {};

  const displayNameValidation = new Validator(displayName)
    .exists()
    .is("string")
    .length.greaterThanOrEqualTo(5)
    .length.lessThanOrEqualTo(50);

  if (displayNameValidation.getFailed()) {
    return error({
      displayName: displayNameValidation.getErrors(),
    });
  }

  let result: Doc;
  try {
    result = await dyno.putItem({
      TableName,
      Key: {
        id: generateUuid(),
        displayName,
      },
    });
  } catch (err) {
    return error(`Could not put item\n${err}`);
  }

  if (!result.Item) return error(`Not Found`, 404);

  return ok(result.Item);
}
