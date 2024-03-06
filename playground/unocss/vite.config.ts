import { defineConfig } from "vite";

import UnoCSS from "unocss/vite";
// import UnoCSS from '@unocss/svelte-scoped/vite'

import { fullstack } from "@leanweb/fullstack";

export default defineConfig({
  plugins: [UnoCSS(), fullstack()],
});
