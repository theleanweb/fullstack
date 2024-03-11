import { defineConfig } from "vite";

import extractorSvelte from "@unocss/extractor-svelte";
import UnoCSS from "unocss/vite";

import { telefunc } from 'telefunc/vite';

import { fullstack } from "@leanweb/fullstack";
import simpleScope from "vite-plugin-simple-scope";

export default defineConfig({
  // base: "/static",
  plugins: [
    UnoCSS({ extractors: [extractorSvelte()] }),
    fullstack(),
    simpleScope(),
    telefunc()
  ],
});
