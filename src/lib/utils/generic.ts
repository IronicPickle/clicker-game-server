export function ok(body: unknown, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

export function error(message: string, statusCode = 500) {
  return ok({ message: message }, statusCode);
}

export const parseBody = <B>(body?: string): B | null => {
  let parsedBody = null;
  try {
    if (body) parsedBody = JSON.parse(body);
  } catch (_err) {}
  return parsedBody;
};
