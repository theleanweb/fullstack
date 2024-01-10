import * as path from "node:path";

import * as RA from "effect/ReadonlyArray";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";

import render from "dom-serializer";
import { ChildNode, DomHandler } from "domhandler";
import { Parser } from "htmlparser2";
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

function walkChildren(
  nodes: ChildNode[],
  visitor: (node: ChildNode) => ChildNode
): ChildNode[] {
  return nodes.map((node) => {
    const _node = node;

    if ("childNodes" in _node) {
      _node.childNodes = walkChildren(_node.childNodes, visitor);
    }

    return visitor(_node);
  });
}

export const PREFIX = "s";

export function transform(
  code: string,
  { filename, cwd = process.cwd() }: { cwd: string; filename: string }
): Effect.Effect<never, Error, string> {
  return Effect.async((resume) => {
    const handler = new DomHandler((error, dom) => {
      if (error) {
        resume(Effect.fail(error));
      } else {
        const nodes = walkChildren(dom, (node) => {
          const name = ("name" in node ? node.name : node.type) as Tags;
          const rules = rules_by_tag[name];

          if ("attribs" in node && rules) {
            for (let rule of rules) {
              if (name === rule.tag) {
                for (let name in node.attribs) {
                  const value = node.attribs[name];

                  const parsed = path.parse(filename);

                  if (name === rule.attribute && value && isLocalPath(value)) {
                    const resolved = path.resolve(parsed.dir, value);
                    const source = path.relative(cwd, resolved);
                    node.attribs[name] = `${value}?${PREFIX}=${source}`;
                  }
                }
              }
            }
          }

          return node;
        });

        resume(Effect.succeed(render(nodes, { encodeEntities: false })));
      }
    });

    const parser = new Parser(handler, {
      lowerCaseTags: false,
      recognizeSelfClosing: true,
    });

    parser.write(code);

    parser.end();
  });
}
