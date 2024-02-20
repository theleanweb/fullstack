export const controller = (name: string) => `
import {Hono} from 'hono';

import { renderSSR } from "@leanweb/fullstack/runtime/Render";

import {edit, show} from './utils';

import New from '@/views/pages/${name}/new.svelte?ssr';
import Edit from '@/views/pages/${name}/edit.svelte?ssr';
import Show from '@/views/pages/${name}/show.svelte?ssr';
import Index from '@/views/pages/${name}/index.svelte?ssr';

const router = new Hono();

// Index
router.get('/', ctx => ctx.html(renderSSR(Index)));

// New
router.get('/new', ctx => ctx.html(renderSSR(New)));

// Create
router.post('/', ctx => ctx.redirect('/${name}'));

// Show
router.get('/:id', ctx => ctx.html(renderSSR(Show)));

// Edit
router.get('/:id/edit', ctx => ctx.html(renderSSR(Edit)));

// Update
router.patch('/:id', ctx => ctx.redirect(show({id: ctx.req.param('id')})));

// Delete
router.delete('/:id', ctx => ctx.redirect('/${name}'));

export const name = "${name}";

export default router;
`;

export const index = (name: string) => /*html*/ `
<script>
    import {show} from '@/controllers/${name}/utils'
  export let ${name}_list;
</script>

<ul>
    {#each ${name}_list as ${name}}
    <li>
        <a href="{show({id: ${name}.id})}">{${name}.title}</a>
    </li>
    {/each}
</ul>
`;

export const show = (name: string) => /*html*/ `
<script>
    import {edit, destroy} from '@/controllers/${name}/utils';
    export let ${name};
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
</ul>
`;

export const new_ = /*html*/ `
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
</form>
`;

export const utils = (name: string) => `
import {compile} from "path-to-regexp";

export const show = compile('${name}/:id');
export const edit = compile('${name}/:id/edit');
`;
