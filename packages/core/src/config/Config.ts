import * as Effect from "effect/Effect";
import z from "zod";

import { options, Options, ValidatedOptions } from "./options.js";

export class ConfigError {
  readonly _tag = "ConfigError";
  constructor(readonly error: z.ZodError<Options>) {}
}

export function parse(
  config: Options
): Effect.Effect<never, ConfigError, ValidatedOptions> {
  const _ = options.safeParse(config);
  // @ts-expect-error
  return _.success
    ? Effect.succeed(_.data)
    : Effect.fail(new ConfigError(_.error));
}
