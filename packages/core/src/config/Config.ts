import z, { SafeParseReturnType } from "zod";

import { options, Options, ValidatedOptions } from "./options.js";

export class ConfigError {
  readonly _tag = "ConfigError";
  constructor(readonly error: z.ZodError<Options>) {}
}

export function parse(
  config: Options
): SafeParseReturnType<Options, ValidatedOptions> {
  return options.safeParse(config);
}
