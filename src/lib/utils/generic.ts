import Validator from "../../../../clicker-game-shared/utils/Validator.ts";
import { APIGatewayProxyEventV2 } from "../../deps.ts";
import { ValidationErrors } from "../../../../clicker-game-shared/ts/api/generic.ts";
import { GenericErrorCode } from "../../../../clicker-game-shared/enums/api/generic.ts";

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

export function error(
  error: string,
  errorCode: string = GenericErrorCode.InternalServerError,
  statusCode = 500
) {
  return ok({ error, errorCode, validation: { failed: false } }, statusCode);
}

export function notFoundError(
  error: string,
  errorCode: string = GenericErrorCode.NotFound
) {
  return ok(
    {
      error,
      errorCode,
      validation: { failed: false },
    },
    404
  );
}

export function validationError(validation: ValidationErrors<any>) {
  return ok(
    {
      error: "Validation failed",
      errorCode: GenericErrorCode.ValidationError,
      validation,
    },
    400
  );
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

export const parseValidators = <K extends string | number | symbol>(
  validators: Record<K, Validator>
): ValidationErrors<K> => {
  let failed = false;
  const errors = {} as Record<K, string[]>;

  for (const i in validators) {
    const validator = validators[i];

    errors[i] = validator.getErrors();
    if (errors[i].length > 0) failed = true;
  }

  return { failed, ...errors };
};
