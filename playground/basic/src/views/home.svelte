<script lang="ts">
  import Footer from "./footer.svelte";
  import Island from "./Island.svelte";
  // import Inner from "./inner.svelte";

  import math, { pi } from "./math";

  export let count: number;
  export let counter: string;

  const data = JSON.stringify(count);

  const list = [{ age: 100 }];

  const num = new Array(100).fill(0).map((_, i) => i);

  function hydrate(node: any) {
    console.log("use: ", node, math);
  }

  const href = "./style.css";
</script>

<Footer {count} />
