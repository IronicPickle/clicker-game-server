import Validator from "../../../../clicker-game-shared/utils/Validator.ts";

export function ok(body: unknown = { message: "success" }, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

export function error(message: any, statusCode = 500) {
  return ok({ message: message }, statusCode);
}

export const parseBody = <B>(body?: string): B | null => {
  if (typeof body === "object") return body;
  let parsedBody = null;
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
