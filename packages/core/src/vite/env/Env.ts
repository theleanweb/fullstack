import path from "node:path";
import fs from "node:fs";

import { dedent } from "ts-dedent";
import { loadEnv } from "vite";

import { reserved, valid_identifier, GENERATED_COMMENT } from "./Utils.js";

export type EnvType = "public" | "private";

export type EnvKind = Record<string, string>;

export type Env = Record<"public" | "private", EnvKind>;

type EnvPrefix = Record<"public_prefix" | "private_prefix", string>;

// Load environment variables from process.env and .env files
export function load({
  dir,
  mode,
  ...env_config
}: {
  dir: string;
  mode: string;
  publicPrefix: string;
  privatePrefix: string;
}) {
  const { publicPrefix: public_prefix, privatePrefix: private_prefix } =
    env_config;

  const env = loadEnv(mode, dir, "");

  return {
    public: filterPublicEnv(env, { public_prefix, private_prefix }),
    private: filterPrivateEnv(env, { public_prefix, private_prefix }),
  };
}

export function createModule(
  id: string,
  env: Record<string, string>,
  warnPrivate?: boolean
) {
  const declarations: string[] = [];

  if (warnPrivate) {
    declarations.push(`console.warn(${JSON.stringify(msg)})`);
  }

  for (const key in env) {
    if (!valid_identifier.test(key) || reserved.has(key)) {
      continue;
    }

    const comment = `/** @type {import('${id}').${key}} */`;
    const declaration = `export const ${key} = ${JSON.stringify(env[key])};`;

    declarations.push(`${comment}\n${declaration}`);
  }

  return GENERATED_COMMENT + declarations.join("\n\n");
}

const msg =
  "Private environment variable(s) imported into client code which might be a mistake";

function createTypes(id: EnvType, env: Env) {
  const declarations = Object.keys(env[id])
    .filter((k) => valid_identifier.test(k))
    .map((k) => `export const ${k}: string;`);

  return dedent`
    declare module '$env/${id}' {
        ${declarations.join("\n")}
    }`;
}

function filterPrivateEnv(
  env: EnvKind,
  {
    public_prefix,
    private_prefix,
  }: {
    public_prefix: string;
    private_prefix: string;
  }
) {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([k]) =>
        k.startsWith(private_prefix) &&
        (public_prefix === "" || !k.startsWith(public_prefix))
    )
  );
}

function filterPublicEnv(
  env: EnvKind,
  { public_prefix, private_prefix }: EnvPrefix
) {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([k]) =>
        k.startsWith(public_prefix) &&
        (private_prefix === "" || !k.startsWith(private_prefix))
    )
  );
}

const template = (env: Env) => `
${GENERATED_COMMENT}

${createTypes("private", env)}
${createTypes("public", env)}
`;

/**
 * Writes ambient declarations  environment variables in process.env to
 * $env/private and $env/public
 */
export function writeTypes(env: Env, { outDir }: { outDir: string }) {
  fs.writeFileSync(path.join(outDir, "env.d.ts"), template(env));
}

// function createTypes(env: EnvKind) {
//   const declarations = Object.keys(env)
//     .filter((k) => valid_identifier.test(k))
//     .map((k) => `readonly ${k}: string;`);

//   return dedent`
//     interface ImportMetaEnv {
//         ${declarations.join("\n")}
//     }

//     interface ImportMeta {
//       readonly env: ImportMetaEnv
//     }
//     `;
// }

// export function extendViteEnvTypes(
//   env: EnvKind,
//   { outDir }: { outDir: string }
// ) {
//   fs.writeFileSync(path.join(outDir, "env.d.ts"), createTypes(env));
// }
