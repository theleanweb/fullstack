// import { inspect } from "util";
// import url from "node:url";
import path from "node:path";

// import { pipe } from "effect/Function";
// import * as Array from "effect/ReadonlyArray";

// import { Plugin } from "vite";

import * as lexer from "es-module-lexer";
import MagicString from "magic-string";
import { ImportsExports, parseImportsExports } from "parse-imports-exports";
import { PreprocessorGroup, parse, preprocess, walk } from "svelte/compiler";
import { dedent } from "ts-dedent";

import { ParsedStaticImport, findStaticImports } from "mlly";

import { PREFIX } from "./devServer/assetRef/AssetRef.js";

// type Loc = { line: number; column: number };

// interface AttributeValue {
//   start: 1157;
//   end: 1164;
//   type: "MustacheTag";
//   expression: {
//     end: number;
//     name: string;
//     start: number;
//     type: "Identifier";
//     loc: { end: Loc; start: Loc };
//   };
// }

// interface RawValue {
//   start: 1201;
//   end: 1204;
//   type: "Text";
//   raw: string;
//   data: string;
// }

type AttributeValue = boolean | "";

interface Attribute {
  end: number;
  name: string;
  start: number;
  type: "Attribute";
  value: AttributeValue;
}

interface Node {
  start: number;
  end: number;
  name: string;
}

const MARKER = "__island";

const cwd = process.cwd();

export function island(): PreprocessorGroup {
  return {
    name: "preprocessor:island",
    markup: async (args) => {
      // console.log("here");

      if (true) {
        const s = new MagicString(args.content, {
          filename: args.filename ?? "",
        });

        const ast = parse(args.content);

        let namedImports: ImportsExports["namedImports"] = {};

        const importMap: Record<string, ParsedStaticImport> = {};

        // console.log("\nimports: ", args);

        await preprocess(
          args.content,
          {
            name: "extract-imports",
            async script({ content }) {
              await lexer.init;
              // const [imports, exports] = lexer.parse(content);

              const r = parseImportsExports(content);

              const [match0] = findStaticImports(content);

              // console.log("analyze: ", args.filename, match0);

              if (match0) {
                importMap[match0.imports.trim()] = match0;
              }

              // console.log(r.namedImports);

              namedImports = r.namedImports;

              // imports.map((_) => {
              //   // console.log("here: ", content.slice(_.s, _.e));
              //   imports_.push(content.slice(_.s, _.e));
              // });
            },
          },
          { filename: args.filename }
        );

        // console.log("import map: ", importMap);

        let arrangedNamedImports: Record<string, string> = {};

        for (let url in namedImports) {
          const [named] = namedImports[url];
          if (named.default) arrangedNamedImports[named.default] = url;
        }

        // const arrangedNamedImports = pipe(
        //   Object.entries(namedImports),
        //   Array.map(([url, _]) => {
        //     return [_[0].default, url] as const;
        //   }),
        //   // Record.fromEntries
        // );

        // console.log("\nimports: ", arrangedNamedImports);

        if (ast.html) {
          let code = args.content;

          // @ts-expect-error
          walk(ast.html, {
            enter(node) {
              // console.log(node);
              // @ts-expect-error
              if (node.type == "InlineComponent") {
                const node_: Node = node;
                const { attributes } = node;
                const attrs: Attribute[] = attributes;

                const isIsland = attrs.find((_) => _.name == MARKER);

                // console.log("isIsland: ", isIsland);

                if (isIsland) {
                  const props = attrs.filter((_) => _.name !== MARKER);

                  const data_ = props.map((prop) => {
                    if (globalThis.Array.isArray(prop.value)) {
                      const [val] = prop.value;

                      if (
                        val.type == "MustacheTag" ||
                        val.type == "AttributeShorthand"
                      ) {
                        if (val.expression.type == "Literal") {
                          return `"${prop.name}": ${JSON.stringify(
                            val.expression.value
                          )}`;
                        }

                        if (val.expression.type == "Identifier") {
                          return `"${prop.name}": ${val.expression.name}`;
                        }

                        const { name, value, raw } = val.expression;
                        return `"${prop.name}": ${value ?? name ?? raw}`;
                      }

                      if (val.type == "Text") {
                        return `"${prop.name}": ${JSON.stringify(val.raw)}`;
                      }
                    }
                  });

                  let data = `{
                    ${data_.join(",\n")}
                  }`;

                  const named = importMap[node_.name];
                  const original = s.slice(node_.start, node_.end);

                  // console.log("here: ", node_.name, named, namedImports);

                  const id = `${node_.name}_DATA_${node_.start}:${node_.end}`;

                  let importUrl = named?.imports;

                  if (args.filename && named) {
                    const [_, query] = named.specifier.split(`?`, 2);

                    const search = new URLSearchParams(query);

                    const parsed = path.parse(args.filename);

                    const resolved = path.resolve(parsed.dir, named.specifier);
                    const source = path.relative(cwd, resolved);

                    search.set(PREFIX, source);
                    // search.set("ssr", "");

                    importUrl = resolved;
                  }

                  console.log("importUrl: ", importUrl, named);

                  if (importUrl) {
                    s.overwrite(
                      node_.start,
                      node_.end,
                      dedent`
                      <div id='${id}_root'>
                      ${original}
                      <script id='${id}' type='module' data={JSON.stringify(${data})}>
                      import ${node_.name} from ${JSON.stringify(importUrl)};
                      
                      const data = JSON.parse(document.getElementById("${id}").getAttribute('data'));
                      console.log('DATA:', data)
                      console.log(${node_.name})
                      
                      const counter = new ${node_.name}({
                          props: data,
                          hydrate: true,
                          target: document.getElementById("${id}_root"),
                      });
                      </script>
                      </div>
                      
                      
                      `
                    );

                    code = s.toString();
                  }
                }

                // console.log(inspect(node, false, Infinity));
              }
            },
          });

          return {
            code,
          };
        }
      }

      // console.log("\nthis runs first: ", args);
    },
  };
}

export function pluginIsland() {
  // const plugin: Plugin = {
  //   name: "fullstack:island",
  // };
}
