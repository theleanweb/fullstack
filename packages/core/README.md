# Core

## Features

- Markdown (.svx)
- Hot reload
- HTML asset bundling
- Islands *(coming soon)*

## Configuration

Fullstack is simple a vite plugin, you configure it like any other vite plugin

```ts
import { defineConfig } from "vite";
import { fullstack } from "@leanweb/fullstack";

export default defineConfig({
  plugins: [
    fullstack({
      /* ...config */
    }),
  ],
});
```

### API

- `publicEnvPrefix`: default `PUBLIC\_`
- `extensions`: default `.svelte`, `.svx`
- `serverEntry`: default src/entry.{js,ts,mjs,mts}
- `preprocess`: see [here](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#preprocess)
- `compilerOptions`: see [here](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#compileroptions)

## Svelte SSR

To import svelte files as SSR components include `ssr` query in file import i.e

```ts
import About from "./views/about.svelte?ssr";
```

Which also gives you TypeScript types for the SSR output.

Non SSR components can be imported normally i.e

```ts
import About from "./views/about.svelte";
```
