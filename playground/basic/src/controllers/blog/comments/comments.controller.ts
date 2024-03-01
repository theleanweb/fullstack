import {Hono} from 'hono'
import {edit, show} from './comments.utils.js'
import { renderSSR } from "@leanweb/fullstack/runtime/Render"
import New from '../../../views/pages/blog/comments/new.svelte?ssr'
import Edit from '../../../views/pages/blog/comments/edit.svelte?ssr'
import Show from '../../../views/pages/blog/comments/show.svelte?ssr'
import Index from '../../../views/pages/blog/comments/index.svelte?ssr'

const router = new Hono();

router.get('/', ctx => ctx.html(renderSSR(Index, {})));

router.get('/new', ctx => ctx.html(renderSSR(New, {})));

router.get('/:id', ctx => ctx.html(renderSSR(Show, {})));

router.get('/:id/edit', ctx => ctx.html(renderSSR(Edit, {})))

// Create
router.post('/', ctx => ctx.redirect('/comments'));

// Update
router.patch('/:id', ctx => ctx.redirect(show({id: ctx.req.param('id')})));

// Delete
router.delete('/:id', ctx => ctx.redirect('/comments'));

export const name = "comments";

export {router};