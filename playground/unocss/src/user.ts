import type { Context } from "hono";

export const show = (ctx: Context) => ctx.text('hello')