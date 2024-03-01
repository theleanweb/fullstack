import { Hono } from "hono";
import { renderSSR } from "@leanweb/fullstack/runtime/Render";
import { edit, show } from "./blog.utils.js";

import New from "../../../views/pages/blog/new.svelte?ssr";
// import Edit from "../../../views/pages/blog/edit.svelte?ssr";
import Show from "../../../views/pages/blog/show.svelte?ssr";
import Index from "../../../views/pages/blog/index.svelte?ssr";

const router = new Hono();

// Index
router.get("/", (ctx) =>
  ctx.html(renderSSR(Index, { blog: [{ id: 1, title: "One" }] }))
);

// New
router.get("/new", (ctx) => ctx.html(renderSSR(New, {})));

// Create
router.post("/", (ctx) => ctx.redirect("/blog"));

// Show
router.get("/:id", (ctx) => ctx.html(renderSSR(Show, {})));

// Edit
// router.get("/:id/edit", (ctx) => ctx.html(renderSSR(Edit, {})));

// Update
router.patch("/:id", (ctx) => ctx.redirect(show({ id: ctx.req.param("id") })));

// Delete
router.delete("/:id", (ctx) => ctx.redirect("/blog"));

export const name = "blog";

export default router;
