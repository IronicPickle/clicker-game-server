import {
  APIGatewayProxyEventV2,
  Context,
} from "https://deno.land/x/lambda/mod.ts";
import { Doc } from "https://denopkg.com/chiefbiiko/dynamodb/mod.ts";

import { dyno } from "../dynamo.ts";
import { error, ok, parseBody } from "../lib/utils/generic.ts";

export const TableName = "sessions";

export async function get(event: APIGatewayProxyEventV2, _context: Context) {
  const { id } = event.pathParameters ?? {};
  if (id == null) return error(`'id' is required in params`);

  console.log("test");

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
  const { id } = parseBody<{ id: string }>(event.body) ?? {};
  if (id == null) return error(`'id' is required in body`);

  let result: Doc;
  try {
    result = await dyno.putItem({
      TableName,
      Key: {
        id,
      },
    });
  } catch (err) {
    return error(`Could not put item\n${err}`);
  }

  if (!result.Item) return error(`Not Found: ${id}`, 404);

  return ok(result.Item);
}
