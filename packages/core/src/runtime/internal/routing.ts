import { Handler } from "hono";

export function lazy(handler: () => Promise<Handler>): Handler {
  return async (ctx, next) => {
    const fn = await handler();
    return fn(ctx, next);
  };
}
