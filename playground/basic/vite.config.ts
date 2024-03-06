import { defineConfig } from "vite";

import UnoCSS from "unocss/vite";
import extractorSvelte from "@unocss/extractor-svelte";

import { fullstack } from "@leanweb/fullstack";
import simpleScope from "vite-plugin-simple-scope";
import tailwindcss from "@vituum/vite-plugin-tailwindcss";

export default defineConfig({
  // base: "/static",
  plugins: [
    UnoCSS({ extractors: [extractorSvelte()] }),
    fullstack(),
    simpleScope(),
  ],
});
