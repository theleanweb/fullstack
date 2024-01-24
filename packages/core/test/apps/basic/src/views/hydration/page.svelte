<script lang="ts">
  import { Html } from "@leanweb/fullstack/runtime";
  import Counter from "./counter.svelte";

  export let count = 0;
</script>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hydrate</title>
  </head>
  <body>
    <div class="counter"><Counter {count} /></div>

    {@html Html.script_json({ count }, { id: "counter" })}
    <script type="module" src="./script.ts"></script>
  </body>
</html>
