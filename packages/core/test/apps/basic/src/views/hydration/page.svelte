<script lang="ts">
  import { Html } from "@leanweb/fullstack/runtime";
  import { onMount } from "svelte";
  export let count = 0;

  onMount(() => {
    setInterval(() => {
      count += count + 1;
    }, 1000);
  });
</script>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="module" src="./script.ts"></script>
    <title>Hydrate</title>
  </head>
  <body>
    <p>{count}</p>
    {@html Html.script_json({ count }, { id: "counter" })}
  </body>
</html>
