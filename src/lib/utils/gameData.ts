import { dayjs } from "../../deps.ts";
import DynoTable from "./DynoTable.ts";

const GameData = new DynoTable("gameData");

export const validateMoneyEarned = async (
  id: string,
  activeMoneyEarned: number
) => {
  const { err, data } = await GameData.getItemById(id);
  if (err || !data) return null;

  const { Item } = data;
  if (!Item) return null;

  const { money } = Item;
  const updatedOn = dayjs(Item.lastUpdated);

  return money + activeMoneyEarned;
};
