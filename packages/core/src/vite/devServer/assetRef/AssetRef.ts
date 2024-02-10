import * as path from "node:path";

import { pipe } from "effect/Function";
import * as RA from "effect/ReadonlyArray";

import type { PreprocessorGroup } from "svelte/compiler";
import { parse, walk } from "svelte/compiler";
import type { BaseNode, Element } from "svelte/types/compiler/interfaces";

import MagicString from "magic-string";

import { Rule, Tags, rules } from "./Rules.js";

const rules_by_tag = pipe(
  rules,
  RA.reduce({} as Record<Tags, Rule[]>, (acc, rule) => {
    acc[rule.tag] = [...(acc[rule.tag] ?? []), rule];
    return acc;
  })
);

function isLocalPath(path: string) {
  return (
    !path.startsWith("http:") &&
    !path.startsWith("https:") &&
    !path.startsWith("//") &&
    path.startsWith(".")
  );
}

export const PREFIX = "s";

export function preprocessor({
  cwd,
}: // filename,
{
  cwd: string;
  // filename: string;
}): PreprocessorGroup {
  return {
    name: "attach-assets",
    markup(args) {
      const name = args.filename!;

      const ast = parse(args.content);
      const parsed = path.parse(name);

      const s = new MagicString(args.content, { filename: name });

      function walkChildren(
        node: BaseNode,
        visitor: (node: BaseNode) => BaseNode
      ): BaseNode {
        if ("children" in node) {
          node.children = node.children?.map((_) => walkChildren(_, visitor));
        }

        return visitor(node);
      }

      // @ts-expect-error
      walk(ast.html, {
        enter(node) {
          // @ts-expect-error
          walkChildren(node, (node) => {
            if (node.type == "Element") {
              const node_: Element = node as any;

              const name = node_.name as Tags;
              const rules = rules_by_tag[name];

              if (rules) {
                for (let rule of rules) {
                  if (name === rule.tag) {
                    for (let attr of node_.attributes) {
                      if (
                        attr.type == "Attribute" &&
                        attr.name == rule.attribute
                      ) {
                        const value = attr.value;

                        for (let val of value) {
                          const content = val.raw;

                          if (val && isLocalPath(content)) {
                            const resolved = path.resolve(parsed.dir, content);
                            const source = path.relative(cwd, resolved);
                            const src = `${content}?${PREFIX}=${source}`;
                            s.update(val.start, val.end, src);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          });
        },
      });

      return { code: s.toString(), map: s.generateMap() };
    },
  };
}
