import { defineConfig } from "vite";

import { fullstack } from "@leanweb/fullstack";
import simpleScope from "vite-plugin-simple-scope";

export default defineConfig({
  plugins: [
    // telefunc(),
    fullstack(),
    simpleScope(),
  ],
});
