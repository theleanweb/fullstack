import * as fs from "node:fs";
import * as path from "node:path";

import { dedent } from "ts-dedent";

const VIEWS = "src/views";
const CONTROLLERS = "src/controllers";

export function write(
  name_: string,
  type: "view" | "controller" | "both" = "both"
) {
  const name = path.basename(name_);

  const modPath = path.resolve(CONTROLLERS, "mod.ts");

  const entityViewsDirectory = path.resolve(VIEWS, name_);
  const entityControllerDirectory = path.resolve(CONTROLLERS, name_);

  const entityControllerPath = path.join(
    entityControllerDirectory,
    `${name}.controller.ts`
  );

  const entityUtilsPath = path.join(
    entityControllerDirectory,
    `${name}.utils.ts`
  );

  const viewImportPath = path.relative(
    entityControllerDirectory,
    entityViewsDirectory
  );

  const controllerImportPath = path.relative(
    entityViewsDirectory,
    entityControllerDirectory
  );

  if (type == "controller" || type == "both") {
    const imports: string[] = [
      "import {Hono} from 'hono'",
      `import {edit, show} from './${name}.utils.js'`,
    ];

    if (type == "both") {
      imports.push(
        'import { renderSSR } from "@leanweb/fullstack/runtime/Render"',
        `import New from '${viewImportPath}/new.svelte?ssr'`,
        `import Edit from '${viewImportPath}/edit.svelte?ssr'`,
        `import Show from '${viewImportPath}/show.svelte?ssr'`,
        `import Index from '${viewImportPath}/index.svelte?ssr'`
      );
    }

    const routes: string[] = [];

    routes.push(
      type == "controller"
        ? "router.get('/', ctx => ctx.json([]))"
        : "router.get('/', ctx => ctx.html(renderSSR(Index, {})))"
    );

    if (type == "both") {
      routes.push("router.get('/new', ctx => ctx.html(renderSSR(New, {})))");
    }

    routes.push(
      type == "controller"
        ? "router.get('/:id', ctx => ctx.json({}))"
        : "router.get('/:id', ctx => ctx.html(renderSSR(Show, {})))"
    );

    if (type == "both") {
      routes.push(
        "router.get('/:id/edit', ctx => ctx.html(renderSSR(Edit, {})))"
      );
    }

    fs.mkdirSync(entityControllerDirectory, { recursive: true });

    fs.writeFileSync(
      entityUtilsPath,
      dedent`
      import {compile} from "path-to-regexp";

      type Params = {id: string | number};

      export const show = compile<Params>('/${name}/:id');
      export const edit = compile<Params>('/${name}/:id/edit');
      export const destroy = compile<Params>('/${name}/:id/destroy');`
    );

    fs.writeFileSync(
      entityControllerPath,
      dedent`
      ${imports.join("\n")}

      const router = new Hono();

      ${routes.join(";\n\n")}

      // Create
      router.post('/', ctx => ctx.redirect('/${name}'));

      // Update
      router.patch('/:id', ctx => ctx.redirect(show({id: ctx.req.param('id')})));

      // Delete
      router.delete('/:id', ctx => ctx.redirect('/${name}'));

      export const name = "${name}";

      export {router};
  `
    );

    fs.writeFileSync(
      modPath,
      dedent`
      import {Hono} from 'hono';
      import * as ${name} from "./${name}/${name}.controller.js";

      const router = new Hono();

      router.route(\`/$\{${name}.name}\`, ${name}.router);

      export default router;
      `
    );

    const routes_ = [
      { name: "index", method: "GET", path: `/${name}` },
      { name: "show", method: "GET", path: `/${name}/:id` },
      { name: "edit", method: "PUT", path: `/${name}/:id` },
      { name: "destroy", method: "DELETE", path: `/${name}/:id` },
    ];

    console.log(`Routes\n\n${routes_.join("\n")}`);
  }

  if (type == "view" || type == "both") {
    const imports = [];

    if (type == "both") {
      imports.push(
        `import {edit, show, destroy} from '${controllerImportPath}/${name}.utils';`
      );
    }

    fs.mkdirSync(entityViewsDirectory, { recursive: true });

    const files = [
      [
        "index.svelte",
        dedent/*html*/ `
        <script lang='ts'>
        ${imports.join("\n")}
        export let ${name}: any[];
        </script>
        
        <ul>
          {#each ${name} as item}
          <li>
            <a href="{show({id: item.id})}">{item.title}</a>
          </li>
          {/each}
        </ul>`,
      ],
      [
        "show.svelte",
        dedent/*html*/ `
        <script lang='ts'>
        ${imports.join("\n")}
        export let ${name}: any;
      </script>
      
      <h1>{${name}.title}</h1>
      <p>{${name}.body}</p>
      
      <ul>
        <li>
          <a href="{edit({id: ${name}.id})}">Edit</a>
        </li>
        
        <li>
          <a href="{destroy({id: ${name}.id})}">Destroy</a>
        </li>
      </ul>`,
      ],
      [
        "new.svelte",
        dedent/*html*/ `
      <form>
        <div>
          <label for="title">Title</label>
          <input type="text" name="title" id="title">
        </div>
        
        <div>
          <label for="body">Body</label>
          <textarea name="body" id="body" cols="30" rows="10"></textarea>
        </div>
        
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>`,
      ],
    ];

    for (const [name, content] of files) {
      fs.writeFileSync(path.join(entityViewsDirectory, name), content);
    }
  }
}
