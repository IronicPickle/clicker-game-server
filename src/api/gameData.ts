import {
  CreateGameDataReq,
  GetGameDataReq,
  UpdateGameDataReq,
} from "../../../clicker-game-shared/ts/api/gameData.ts";
import gameDataValidators from "../../../clicker-game-shared/validators/gameDataValidators.ts";
import { APIGatewayProxyEventV2, Context, dayjs, Doc } from "../deps.ts";
import DynoTable from "../lib/utils/DynoTable.ts";
import {
  error,
  notFoundError,
  ok,
  parseBody,
  parseQuery,
  parseValidators,
  validationError,
} from "../lib/utils/generic.ts";
import { GetGameDataErrorCode } from "../../../clicker-game-shared/enums/api/gameData.ts";
import { validateMoneyEarned } from "../lib/utils/gameData.ts";

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
  const validation = parseValidators(validators);

  const { id, sessionId } = params;

  if (validation.failed) return validationError(validation);

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

  if (!Item) {
    if (sessionId)
      return notFoundError(
        `Not Found: ${id ?? sessionId}`,
        GetGameDataErrorCode.NoGameDataForSession
      );
    else return notFoundError(`Not Found: ${id ?? sessionId}`);
  }

  return ok(Item);
}

export async function create(event: APIGatewayProxyEventV2, _context: Context) {
  const body = parseBody<CreateGameDataReq>(event);

  const validators = gameDataValidators.create(body);
  const validation = parseValidators(validators);

  const { sessionId } = body;

  if (validation.failed || !sessionId) return validationError(validation);

  // Session must exist to create game data
  const session = await Sessions.getItemById(sessionId);
  if (session.err || !session.data)
    return error(`Could not fetch item. ${session.err}`);
  const { Item: SessionItem } = session.data;

  if (!SessionItem)
    return notFoundError(`No session found with id '${sessionId}'`);

  const date = dayjs();

  // Game Data must not exist for current month
  const prevGameData = await getValidGameData(sessionId, date);
  if (prevGameData.err || !prevGameData.data)
    return error(`Could not fetch item. ${prevGameData.err}`);
  const GameDataItem = prevGameData.data.Items[0];

  if (GameDataItem)
    return error(
      `Game data already exists for '${sessionId}' relevant for the current month`
    );

  const Item = {
    id: crypto.randomUUID(),
    sessionId: sessionId,
    money: 0,
    validFrom: date.startOf("month").format(),
    validTo: date.endOf("month").format(),
    createdOn: date.format(),
    updateOn: date.format(),
  };

  const gameData = await GameData.putItem(Item);
  if (gameData.err) return error(`Could not put item. ${gameData.err}`);

  return ok(Item);
}

export async function update(event: APIGatewayProxyEventV2, _context: Context) {
  const body = parseBody<UpdateGameDataReq>(event);

  const validators = gameDataValidators.update(body);
  const validation = parseValidators(validators);

  const { id, activeMoneyEarned } = body;

  if (validation.failed || !id || activeMoneyEarned == null)
    return validationError(validation);

  const date = dayjs();

  const money = validateMoneyEarned(id, activeMoneyEarned);

  const gameData = await GameData.updateItem({
    Key: {
      id,
    },
    UpdateExpression: "set money = :money",
    ConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
      ":money": money,
      ":updatedOn": date.format(),
    },
    ReturnValues: "ALL_NEW",
  });
  if (gameData.err) return error(`Could not update item. ${gameData.err}`);

  return ok(gameData);
}

export async function getAll(
  _event: APIGatewayProxyEventV2,
  _context: Context
) {
  const { err, data } = await GameData.scan();
  if (err || !data) return error(`Could not fetch items. ${err}`);
  const { Items } = data;

  if (!Items) return notFoundError(`Not Found`);

  return ok(Items);
}
