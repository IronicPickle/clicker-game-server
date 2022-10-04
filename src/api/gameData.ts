import {
  CreateGameDataReq,
  GetGameDataReq,
} from "../../../clicker-game-shared/ts/api/gameData.ts";
import gameDataValidators from "../../../clicker-game-shared/validators/gameDataValidators.ts";
import { APIGatewayProxyEventV2, Context, dayjs, Doc } from "../deps.ts";
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

const getValidGameData = async (sessionId: string, date: any = dayjs()) =>
  await GameData.query({
    IndexName: "sessionIndex",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
      ":date": date.format(),
    },
    KeyConditionExpression: "sessionId = :sessionId",
    FilterExpression: ":date between validFrom and validTo",
  });

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
    const { err, data } = await getValidGameData(sessionId);
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

  const date = dayjs();

  // Game Data must not exist for current month
  const prevGameData = await getValidGameData(sessionId, date);
  if (prevGameData.err || !prevGameData.data)
    return error(`Could not fetch item. ${prevGameData.err}`);
  const GameDataItem = prevGameData.data.Items[0];

  if (GameDataItem)
    return error(
      `Game data already exists for '${sessionId}' relevant for the current month`,
      400
    );

  const Item = {
    id: crypto.randomUUID(),
    sessionId: sessionId,
    money: 0,
    validFrom: date.startOf("month").format(),
    validTo: date.endOf("month").format(),
    createdOn: date.format(),
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
