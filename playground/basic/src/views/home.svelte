<script lang="ts">
  import Footer from "./footer.svelte";
  import Island from "./Island.svelte";

  import math, { pi } from "./math";

  import href from "./main.css";

  export let count: number;
  export let counter: string;

  const data = JSON.stringify(count);

  const list = [{ age: 100 }];

  const num = new Array(100).fill(0).map((_, i) => i);

  function hydrate(node: any) {
    console.log("use: ", node, math);
  }
</script>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="icon" href="/favicon.png" />
    <!-- <link rel="stylesheet" href="./main.css" />
    <link rel="stylesheet" href="./style.css" /> -->
    <link rel="stylesheet" href="./main.css" />
    <link rel="stylesheet" href="./style.css" />
    <link rel="stylesheet" {href} />
    <script type="module" src="./script.ts"></script>
    <title>40 Document</title>
  </head>
  <body>
    <!-- <p class="w-full">Hello 3000</p>

    <ion-button>Default</ion-button>
    <ion-button disabled="true">Disabled</ion-button> -->

    <div>ages: {JSON.stringify({ age: list })}</div>

    <img src="/favicon.png" alt="favicon" />

    <!-- <Island count={0} />

    <Footer __island {count} />

    <custom-button __island aria></custom-button> -->

    {#each num as n}
      <p>{n}</p>
    {/each}

    <!-- <section use:hydrate>
      <h1>Footer here</h1>
      <Footer count={5} />
    </section>

    <div class="counter">
      {@html counter}
    </div>

    {@html `<script id="data" type="application/json">${data}</script>`} -->

    <p>
      <script type="module" src="./script.ts"></script>
    </p>
  </body>
</html>
