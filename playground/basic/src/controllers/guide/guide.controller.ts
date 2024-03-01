import { Hono } from "hono";
import { renderSSR } from "@leanweb/fullstack/runtime/Render";
import { edit, show } from "./guide.utils.js";

import New from "../../views/pages/guide/new.svelte?ssr";
// import Edit from '../../../views/pages/guide/edit.svelte?ssr';
import Show from "../../views/pages/guide/show.svelte?ssr";
import Index from "../../views/pages/guide/index.svelte?ssr";

const router = new Hono();

// Index
router.get("/", (ctx) =>
  ctx.html(renderSSR(Index, { guide: [{ id: 1, title: "One" }] }))
);

// New
router.get("/new", (ctx) => ctx.html(renderSSR(New, {})));

// Create
router.post("/", (ctx) => ctx.redirect("/guide"));

// Show
router.get("/:id", (ctx) =>
  ctx.html(renderSSR(Show, { guide: { id: 1, title: "One" } }))
);

// Edit
// router.get('/:id/edit', ctx => ctx.html(renderSSR(Edit, {})));

// Update
router.patch("/:id", (ctx) => ctx.redirect(show({ id: ctx.req.param("id") })));

// Delete
router.delete("/:id", (ctx) => ctx.redirect("/guide"));

export const name = "guide";

export { router };
