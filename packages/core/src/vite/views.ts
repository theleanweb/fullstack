import path from "node:path";
import fs from "node:fs";
import type { Plugin } from "vite";
import { globSync as glob } from "glob";
import { dedent } from "ts-dedent";

const cwd = process.cwd();

const outDir = cwd;
const outFile = path.join(outDir, "views.d.ts");

const prefix = path.join(cwd, "src/views/");

let cache = new Set<string>();

const write = (views: string[]) => {
  fs.writeFileSync(
    outFile,
    dedent`
    import {ComponentProps} from 'svelte';
      
    ${views
      .map((file, i) => `import $${i} from "${relative_path(outDir, file)}";`)
      .join("\n")}
        
    declare module "@leanweb/fullstack/runtime/Render" {
        interface Views {
            ${views
              .map((file, i) => {
                const file_ = file.replace(prefix, "");
                const { dir, name } = path.parse(file_);
                const key = path.join(dir, name);
                const value = `ComponentProps<$${i}>`;
                return [`"${key}": ${value}`, `"${file_}": ${value}`];
              })
              .flat()
              .join(",\n")}
        }
    }
    `
  );
};

export const views: Plugin = {
  name: "fullstack:views",
  config() {
    return {
      server: {
        watch: {
          ignored: [outFile],
        },
      },
    };
  },
  buildStart() {
    const files = glob("**/*.svelte", {
      cwd,
      absolute: true,
      root: "/src/views",
    });

    write(files);

    cache = new Set(files);
  },
  configureServer(server) {
    return () => {
      server.watcher.on("all", (e, file) => {
        if (!file.endsWith(".svelte")) return;

        if (e == "unlink") {
          cache.delete(file);
        }

        if (e == "add") {
          cache.add(file);
        }

        write([...cache]);
      });
    };
  },
};

function posixify(str: string) {
  return str.replace(/\\/g, "/");
}

/**
 * Like `path.join`, but posixified and with a leading `./` if necessary
 */
function join_relative(...str: string[]) {
  let result = posixify(path.join(...str));
  if (!result.startsWith(".")) {
    result = `./${result}`;
  }
  return result;
}

/**
 * Like `path.relative`, but always posixified and with a leading `./` if necessary.
 * Useful for JS imports so the path can safely reside inside of `node_modules`.
 * Otherwise paths could be falsely interpreted as package paths.
 */
function relative_path(from: string, to: string) {
  return join_relative(path.relative(from, to));
}
