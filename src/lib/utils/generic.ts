import Validator from "../../../../clicker-game-shared/utils/Validator.ts";
import { APIGatewayProxyEventV2 } from "../../deps.ts";

export function ok(body: unknown = { message: "success" }, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(body),
  };
}

export function error(message: any, statusCode = 500) {
  return ok({ message: message }, statusCode);
}

export const parseParams = <P>({
  pathParameters,
}: APIGatewayProxyEventV2): Partial<P> => {
  return (pathParameters as any) ?? {};
};

export const parseQuery = <P>({
  queryStringParameters,
}: APIGatewayProxyEventV2): Partial<P> => {
  return (queryStringParameters as any) ?? {};
};

export const parseBody = <B>({ body }: APIGatewayProxyEventV2): Partial<B> => {
  if (typeof body === "object") return body;
  let parsedBody = {};
  try {
    if (body) parsedBody = JSON.parse(body);
  } catch (_err) {}

  return parsedBody;
};

export const parseValidators = <K extends string>(
  validators: Record<K, Validator>
) => {
  let failed = false;
  const errors = {} as Record<K, string[]>;

  for (const i in validators) {
    const validator = validators[i];

    errors[i] = validator.getErrors();
    if (errors[i].length > 0) failed = true;
  }

  return { failed, ...errors };
};
