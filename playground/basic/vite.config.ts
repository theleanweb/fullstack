import { defineConfig } from "vite";

import { fullstack } from "core";
import simpleScope from "vite-plugin-simple-scope";

export default defineConfig({
  // base: "/static",
  plugins: [fullstack(), simpleScope()],
});
