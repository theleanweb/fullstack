import fs from "node:fs";
import path from "node:path";

import fsExtra from "fs-extra";

import { globSync as glob } from "glob";

import color from "kleur";

import type { ConfigEnv, Plugin, ResolvedConfig, Rollup } from "vite";
import * as Vite from "vite";

import { PreprocessorGroup } from "svelte/compiler";

import { mdsvex } from "mdsvex";

import {
  svelte,
  Options as SvelteOptions,
  vitePreprocess,
} from "@sveltejs/vite-plugin-svelte";

import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Option from "effect/Option";
import * as Array from "effect/ReadonlyArray";
import * as String from "effect/String";

import * as Config from "../config/Config.js";
import { Options } from "../config/options.js";
import * as Env from "./env/Env.js";

import * as AssetRef from "./devServer/assetRef/AssetRef.js";
import { devServer } from "./devServer/DevServer.js";
import { previewServer } from "./preview/Server.js";
// import { compressFile } from "./Compress.js";

// interface Manifest {
//   version: string;
//   assetsPath: string;
//   serverEntry: string;
//   publicDirectory: string;
//   assetsBuildDirectory: string;
// }

type Env = Record<"public" | "private", Record<string, any>>;

const VITE_HTML_PLACEHOLDER = "<div data-placeholder></div>";

const obfuscate: Plugin = {
  name: "plugin-obfuscate",
  // we need to execute this before any vite html parser sees it and throws an error
  transformIndexHtml: {
    order: "pre",
    handler(html) {
      return `${VITE_HTML_PLACEHOLDER}\n${html}`;
    },
  },
};

const deobfuscate: Plugin = {
  enforce: "post",
  name: "plugin-deobfuscate",
  transformIndexHtml(html) {
    return html.replace(`${VITE_HTML_PLACEHOLDER}\n`, "");
  },
};

const pattern = color.cyan("src/entry.(js|ts)");

const noDefaultServerEntryMsg = `Couldn't find the default ${pattern} entry file. Please make sure to specify one in the config if you wish to use a different file`;

const noServerEntryMsg = (file: string) =>
  `Couldn't find entry file ${file}. Please make sure the file exists.`;

const cwd = process.cwd();

const markdownPreprocessor = mdsvex() as PreprocessorGroup;

const defaultPreprocessors = [markdownPreprocessor, vitePreprocess()];

export default function fullstack(userConfig?: Options) {
  const root = ".cache";

  const publicDirectory = "public";
  // const assetsBuildDirectory = "public/build";

  const buildDir = path.join(root, "build");
  const generatedDir = path.join(root, "generated");

  const configResult = Config.parse(userConfig ?? {}).pipe(
    Effect.either,
    Effect.runSync
  );

  if (Either.isLeft(configResult)) {
    const { fieldErrors } = configResult.left.error.flatten();

    const errors: string[] = [];

    for (let k in fieldErrors) {
      const error = fieldErrors[k as keyof typeof fieldErrors];

      if (error) {
        errors.push(`${color.gray(`- ${k}:`)} ${color.red(error.join(", "))}`);
      }
    }

    console.log(color.bold(color.yellow("Config error")));
    console.log(errors.join("\n"));
    console.log(); // new line

    process.exit(1);
  }

  const { compilerOptions, ...config } = configResult.right;

  const preprocessors = config.preprocess
    ? globalThis.Array.isArray(config.preprocess)
      ? [...config.preprocess, ...defaultPreprocessors]
      : [config.preprocess, ...defaultPreprocessors]
    : defaultPreprocessors;

  const serverEntry = glob(config.serverEntry, { cwd });

  const entry = Array.head(serverEntry);

  if (Option.isNone(entry)) {
    const msg =
      userConfig?.serverEntry != undefined
        ? noServerEntryMsg(userConfig.serverEntry)
        : noDefaultServerEntryMsg;

    console.log(color.red("No server entry file found"));
    console.log(color.yellow(msg));
    console.log(); // new line

    process.exit(1);
  }

  let resolvedViteConfig: ResolvedConfig;
  let configEnv: ConfigEnv;
  let plugins: Plugin[];

  let env: Env.Env;

  // const manifest: Manifest = {
  //   version: "1.0.0",
  //   assetsPath: "/build",
  //   serverEntry: "src/entry",
  //   publicDirectory: "public",
  //   assetsBuildDirectory: "public/build",
  // };

  // const manifest_ = pipe(
  //   Object.keys(manifest),
  //   Array.map((k) => {
  //     const key = k as keyof Manifest;
  //     return `export const ${k} = ${JSON.stringify(manifest[key])}`;
  //   }),
  //   Array.join(";\n")
  // );

  // console.log(manifest_);

  const setup: Plugin = {
    name: "fullstack:setup",
    configResolved(config) {
      resolvedViteConfig = config;

      /** we want to re-use plugins defined in the user's vite config, but doing so causes
       * the internal vite plugins to throw error when we try to perform the secondary build to process
       * html assets.
       *
       * So we need to remove them, not sure what are the side effects of doing that. But there should be no
       * issue given the secondary build has the same plugins applied by vite.
       *
       * We also remove our plugins to avoid an infinite loop of secondary builds.
       */
      plugins = config.plugins.filter(
        (_) =>
          _.name != "fullstack:setup" &&
          _.name != "fullstack:build" &&
          _.name != "fullstack:dev" &&
          _.name != "fullstack:server-env" &&
          _.name != "vite:build-html" &&
          _.name != "vite:build-import-analysis"
      );
    },
    config(_, env) {
      configEnv = env;

      return {
        appType: "custom",
        build: {
          ssr: true,
          ssrEmitAssets: true,
          copyPublicDir: false,
          rollupOptions: {
            input: { index: entry.value },
          },
        },
        resolve: {
          alias: [
            {
              find: "__GENERATED__",
              replacement: generatedDir,
            },
          ],
        },
        optimizeDeps: {
          exclude: ["@leanweb/fullstack", "$env"],
        },
      };
    },
  };

  // const pluginEnv: Plugin = {
  //   name: "fullstack:env",

  //   configResolved(config) {
  //     const env = Vite.loadEnv(
  //       viteConfigEnv.mode,
  //       config.envDir,
  //       config.envPrefix
  //     );

  //     Env.extendViteEnvTypes(env, { outDir: cwd });
  //   },
  // };

  const pluginEnv: Plugin = {
    name: "fullstack:env",

    configResolved(config) {
      env = Env.load({
        privatePrefix: "",
        dir: config.envDir,
        publicPrefix: "PUBLIC_",
        mode: configEnv.mode,
      });

      Env.writeTypes(env, { outDir: cwd });
    },

    resolveId(source, importer) {
      // treat $env/[public|private] as virtual
      if (source.startsWith("$env/")) {
        if (importer) {
          const req = parseId(importer);

          if (isView(req.filename)) {
            const name = color.bold(req.filename.replace(cwd, ""));
            const msg = `Client module ${name} imports private environment variable(s)`;
            console.log(color.yellow(msg));
          }
        }

        return `\0${source}`;
      }
    },
  };

  const clientEnv: Plugin = {
    name: "fullstack:client-env",
    load(id) {
      switch (id) {
        case "\0$env/public":
          return Env.createModule("$env/public", env.public);
        case "\0$env/private":
          return Env.createModule(
            "$env/private",
            env.private,
            configEnv.mode == "development"
          );
      }
    },
  };

  const serverEnv: Plugin = {
    name: "fullstack:server-env",
    load(id) {
      switch (id) {
        case "\0$env/private":
          return Env.createModule("$env/private", env.private);
      }
    },
  };

  const pluginDev: Plugin = {
    apply: "serve",
    name: "fullstack:dev",
    configureServer(server) {
      return () => {
        server.watcher.on("change", (file) => {
          if (file.endsWith(entry.value)) {
            server.ws.send({ type: "full-reload" });
          }
        });

        return devServer(server, { cwd, entry: entry.value });
      };
    },
  };

  const pluginBuild: Plugin = {
    apply: "build",
    name: "fullstack:build",

    buildStart() {
      const assets = resolvedViteConfig.build.assetsDir;
      const dir = path.join(publicDirectory, assets);
      fsExtra.remove(dir);
    },

    async writeBundle() {
      const assets = resolvedViteConfig.build.assetsDir;

      const src = path.join(buildDir, assets);
      const dest = path.join(publicDirectory, assets);

      if (fs.existsSync(src)) {
        // const files = fs.readdirSync(buildAssetsDir);
        // const files_ = files.map((file) => path.resolve(buildAssetsDir, file));
        // await Promise.all(
        //   files_.flatMap((file) => [
        //     compressFile(file, "gz"),
        //     compressFile(file, "br"),
        //   ])
        // );

        fsExtra.moveSync(src, dest);
      }

      fsExtra.remove(root);
    },

    transform: {
      order: "pre",
      async handler(_, id) {
        const { filename, ...req } = parseRequest(id);

        if (!isView(filename)) return;

        // if (!req.ssr) return;

        const { dir, name } = path.parse(filename);

        const name_ = name + ".html";

        const dir_ = path.join(generatedDir, dir.replace(cwd, ""));

        const id_ = path.join(dir_, name_);

        fsExtra.ensureDirSync(dir_);
        fsExtra.copyFileSync(filename, id_);
        // fsExtra.writeFileSync(id_, code);

        // resolve imports from the original file location
        const resolve: Plugin = {
          name: "plugin-resolve",
          resolveId: (source) => path.resolve(dir, source),
        };

        // const quietLogger = Vite.createLogger();
        // quietLogger.info = () => undefined;

        const result = await Vite.build({
          configFile: false,
          clearScreen: false,
          logLevel: "silent",
          base: resolvedViteConfig.base,
          envPrefix: resolvedViteConfig.envPrefix as string[],
          // customLogger: quietLogger,
          // We apply obfuscation to prevent vite:build-html plugin from freaking out
          // when it sees a svelte script at the beginning of the html file
          plugins: [...plugins, resolve, obfuscate, deobfuscate],
          build: {
            outDir: buildDir,
            emptyOutDir: false,
            copyPublicDir: false,
            rollupOptions: { input: id_ },
          },
        });

        const { output } = result as Rollup.RollupOutput;

        const module = output.find((_) => _.fileName == id_);

        if (module?.type == "asset") {
          return { code: module.source.toString() };
        }
      },
    },
  };

  const pluginPreview: Plugin = {
    name: "fullstack:preview",
    configurePreviewServer(server) {
      return () => previewServer(server);
    },
  };

  // const pluginIsland: Plugin = {
  //   name: "fullstack:island",
  //   transform: {
  //     order: "pre",
  //     async handler(code, id) {
  //       const { filename, ...req } = parseRequest(id);

  //       if (!isView(filename)) return;

  //       // console.log(id);

  //       // if (!req.ssr) return;

  //       const r = await compiler.preprocess(
  //         code,
  //         [vitePreprocess(), island()],
  //         { filename }
  //       );

  //       // console.log(r.toString?.());

  //       return { code: r.code, map: r.map as any };
  //     },
  //   },
  // };

  /**
   * The initial approach of preprocessing components to attach the real disk location
   * didn't play nice with the main svelte plugin and preprocessors. So we have to include our
   * preprocessor to the svelte vite plugin, but the point at which that happens we can't tell if we're in
   * serve or build mode.
   *
   * We don't want to attach any asset reference in build mode os that vite can find them itself. This is a workaround
   * to grab the resolved config when we need it.
   */
  const configProxy = new Proxy({} as ResolvedConfig, {
    get(_, p) {
      return resolvedViteConfig[p as keyof typeof resolvedViteConfig];
    },
  });

  const svelteOptions: SvelteOptions = {
    extensions: config.extensions,
    preprocess: [
      ...preprocessors,
      AssetRef.preprocessor({ cwd, config: configProxy }),
    ],
    compilerOptions: {
      ...compilerOptions,
      hydratable: compilerOptions?.hydratable ?? true,
    },
  };

  return [
    setup,
    clientEnv,
    serverEnv,
    pluginDev,
    pluginEnv,
    pluginBuild,
    pluginPreview,
    // pluginIsland,
    svelte(svelteOptions),
  ];
}

function parseId(id: string) {
  const [filename, query] = id.split(`?`, 2);
  const searchParams = new URLSearchParams(query);
  return { filename, query, searchParams };
}

function parseRequest(id: string) {
  const _ = parseId(id);

  const ssr = Option.fromNullable(_.searchParams.get("ssr")).pipe(
    Option.filter(String.isNonEmpty),
    Option.getOrElse(() => (_.searchParams.has("ssr") ? "true" : "false"))
  );

  return { ..._, ssr: ssr == "true" };
}

function isView(id: string) {
  return id.endsWith(".svelte") || id.endsWith(".svx");
}
