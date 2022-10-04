import { Doc } from "../../deps.ts";
import { dyno } from "./dynamo.ts";

export interface DynoRes {
  data?: Doc;
  err?: any;
}

const exec = async (
  funcName: string,
  params: Doc,
  options?: Doc
): Promise<DynoRes> => {
  const func = dyno[funcName];

  try {
    return {
      data: await func(params, options),
    };
  } catch (err) {
    return {
      err,
    };
  }
};

export default class DynoTable {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async getItemById(id: string) {
    return await exec("getItem", {
      TableName: this.tableName,
      Key: { id },
    });
  }

  public async putItem(item: Doc) {
    return await exec("putItem", {
      TableName: this.tableName,
      Item: item,
    });
  }

  public async scan() {
    return await exec("scan", {
      TableName: this.tableName,
    });
  }

  public async query(params: Doc) {
    return await exec("query", {
      TableName: this.tableName,
      ...params,
    });
  }
}
