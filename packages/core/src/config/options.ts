import z from "zod";
import { CompileOptions, PreprocessorGroup } from "svelte/compiler";

export const options = z.object({
  publicEnvPrefix: z.string().default("PUBLIC_"),
  extensions: z.array(z.string()).default([".svelte", ".svx"]),
  serverEntry: z.string().default("src/entry.{js,ts,mjs,mts}"),
});

type MaybeArray<T> = T | T[];

type SvelteOptions = {
  preprocess?: MaybeArray<PreprocessorGroup>;
  compilerOptions?: Omit<CompileOptions, "filename" | "format" | "generate">;
};

export type Options = z.input<typeof options> & SvelteOptions;

export type ValidatedOptions = z.infer<typeof options> & SvelteOptions;
