import {
  APIGatewayProxyEventV2,
  Context,
} from "https://deno.land/x/lambda@1.25.2/mod.ts";
import { Doc } from "https://denopkg.com/chiefbiiko/dynamodb@master/mod.ts";
import {
  CreateGameDataReq,
  GetGameDataReq,
} from "../../../clicker-game-shared/ts/api/gameData.ts";
import gameDataValidators from "../../../clicker-game-shared/validators/gameDataValidators.ts";

import DynoTable from "../lib/utils/DynoTable.ts";
import {
  error,
  ok,
  parseBody,
  parseQuery,
  parseValidators,
} from "../lib/utils/generic.ts";

const GameData = new DynoTable("gameData");
const Sessions = new DynoTable("sessions");

export async function get(event: APIGatewayProxyEventV2, _context: Context) {
  const params = parseQuery<GetGameDataReq>(event);

  const validators = gameDataValidators.get(params);
  const errors = parseValidators(validators);

  const { id, sessionId } = params;

  if (errors.failed) return error(errors);

  let Item: Doc | undefined = undefined;

  if (id) {
    const { err, data } = await GameData.getItemById(id);
    if (err || !data) return error(`Could not fetch item. ${err}`);
    Item = data.Item;
  } else if (sessionId) {
    const { err, data } = await GameData.queryBySecondaryIndex(
      "sessionIndex",
      "sessionId = :sessionId",
      {
        ":sessionId": sessionId,
      }
    );
    if (err || !data) return error(`Could not query items. ${err}`);
    Item = data.Items[0];
  }

  if (!Item) return error(`Not Found: ${id ?? sessionId}`, 404);

  return ok(Item);
}

export async function create(event: APIGatewayProxyEventV2, _context: Context) {
  const body = parseBody<CreateGameDataReq>(event);

  const validators = gameDataValidators.create(body);
  const errors = parseValidators(validators);

  const { sessionId } = body;

  if (errors.failed || !sessionId) return error(errors);

  // Session must exist to create game data
  const session = await Sessions.getItemById(sessionId);
  if (session.err || !session.data)
    return error(`Could not fetch item. ${session.err}`);
  const { Item: SessionItem } = session.data;

  if (!SessionItem)
    return error(`No session found with id '${sessionId}'`, 404);

  const Item = {
    id: crypto.randomUUID(),
    sessionId: sessionId,
    money: 0,
  };

  const gameData = await GameData.putItem(Item);
  if (gameData.err) return error(`Could not put item. ${gameData.err}`);

  return ok(Item);
}

export async function getAll(
  _event: APIGatewayProxyEventV2,
  _context: Context
) {
  const { err, data } = await GameData.scan();
  if (err || !data) return error(`Could not fetch items. ${err}`);
  const { Items } = data;

  if (!Items) return error(`Not Found`, 404);

  return ok(Items);
}
