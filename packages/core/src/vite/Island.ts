import path from "node:path";

import { ResolvedConfig } from "vite";

import MagicString from "magic-string";
import { findStaticImports } from "mlly";
import { dedent } from "ts-dedent";

import { PreprocessorGroup, parse, walk } from "svelte/compiler";
import { Attribute, BaseNode } from "svelte/types/compiler/interfaces";

const MARKER = "__island";

export const ISLAND_SCRIPT = "@fullstack/island";

const hydrationStore = new Map<string, string>();

export const getHydrationScript = (id: string) => hydrationStore.get(id);

export const clean = () => hydrationStore.clear();

export const island = ({
  cwd,
  config,
}: {
  cwd: string;
  config: ResolvedConfig;
}): PreprocessorGroup => {
  return {
    name: "islands",
    async markup(args) {
      const r = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;

      const name = args.filename ?? "";
      const script = r.exec(args.content);

      if (script) {
        const content = script[1];

        const staticImports = findStaticImports(content);

        const imports = Object.fromEntries(
          staticImports.map((_) => [_.imports.trim(), _])
        );

        const s = new MagicString(args.content, { filename: name });

        const ast = parse(args.content);

        const islands: Array<{ id: string; node: BaseNode }> = [];

        // @ts-expect-error
        walk(ast.html, {
          enter(baseNode) {
            // @ts-expect-error
            if (baseNode.type == "InlineComponent") {
              const node: BaseNode = baseNode;
              const { attributes } = baseNode;
              const attrs: Attribute[] = attributes;

              const isIsland = attrs.find((_) => _.name == MARKER);

              if (isIsland) {
                const attributes = attrs.filter((_) => _.name !== MARKER);

                const props = attributes.map((attr) => {
                  // @ts-expect-error
                  if (attr.type == "Binding" || Array.isArray(attr.value)) {
                    // @ts-expect-error
                    let val = attr.type == "Binding" ? attr : attr.value?.[0];

                    const { name, value, raw } = val.expression;

                    if (
                      val.type == "Binding" ||
                      val.type == "MustacheTag" ||
                      val.type == "AttributeShorthand"
                    ) {
                      if (val.expression.type == "Literal") {
                        return `"${attr.name}": ${JSON.stringify(value)}`;
                      }

                      if (val.expression.type == "Identifier") {
                        return `"${attr.name}": ${name}`;
                      }

                      if (val.expression.type == "ArrayExpression") {
                        const { end, start } = val.expression;
                        return `"${attr.name}": ${s.slice(start, end)}`;
                      }

                      return `"${attr.name}": ${value ?? name ?? raw}`;
                    }

                    if (val.type == "Text") {
                      return `"${attr.name}": ${JSON.stringify(raw)}`;
                    }
                  }
                });

                let serialized = dedent`{
                  ${props.join(",\n")}
                }`;

                const template = s.slice(node.start, node.end);
                const id = `${node.name}_${node.start}:${node.end}`;

                const islandTemplate = /*html*/ `
                <fullstack-island
                id="${id}"
                component="${node.name}"
                style="display: contents;"
                props={JSON.stringify(${serialized})}
                >
                ${template}
                </fullstack-island>`;

                s.overwrite(node.start, node.end, islandTemplate);

                islands.push({ id, node });
              }
            }
          },
        });

        const nodes: string[] = [];
        let trackImports = new Set<string>();
        const componentImports: string[] = [];

        for (let i = 0; i < islands.length; i++) {
          const { node } = islands[i];

          if (trackImports.has(node.name)) continue;

          const staticImport = imports[node.name];

          if (staticImport) {
            let specifier = staticImport.specifier;

            if (config.command == "serve") {
              const parsed = path.parse(name);
              const resolved = path.resolve(parsed.dir, specifier);
              specifier = resolved;
            }

            componentImports.push(`import ${node.name} from "${specifier}";`);
            nodes.push(`"${node.name}": ${node.name}`);

            trackImports.add(node.name);
          }
        }

        const last = islands[islands.length - 1];

        if (last) {
          const { end, start } = last.node;
          const id = `hydrator_${start}:${end}`;

          const hydrationScript = `
          ${componentImports.join("\n")}
          
          const nodes = {${nodes.join(",")}};
          const islands = [${islands.map((_) => `"${_.id}"`)}];
          const hydrator = document.getElementById("${id}");
                
          for (let i = 0; i < islands.length; i++) {
            const id = islands[i];
            const island = document.getElementById(id);
            const component = island.getAttribute('component')
            const props = JSON.parse(island.getAttribute('props'));
            new nodes[component]({props,target: island,hydrate: true});
          }
          
          // hydrator.remove();`;

          hydrationStore.set(id, hydrationScript);

          s.overwrite(
            start,
            end,
            dedent/*html*/ `
            ${s.slice(start, end)}

            <island-hydrator id="${id}" style="display: none;">
              <script type="module" src="@fullstack/island?id=${id}"></script>
            </island-hydrator>
          `
          );
        }

        return { code: s.toString(), map: s.generateMap() };
      }
    },
  };
};
