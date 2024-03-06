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
    <link rel="stylesheet" id="mustache" {href} />
    <script type="module" src="./script.ts"></script>
    <title>40 Document</title>
    <!-- <Footer {count} /> -->
  </head>
  <body>
    <!-- <p class="w-full">Hello 3000</p>

    <ion-button>Default</ion-button>
    <ion-button disabled="true">Disabled</ion-button> -->

    <div>ages: {JSON.stringify({ age: list })}</div>

    <img src="/favicon.png" alt="favicon" />

    <Island __island />

    <hr />

    <!-- <Island child="{Inner}" /> -->

    <!-- <Footer {count} /> -->

    <!-- <custom-button __island aria></custom-button> -->

    {#each num as n}
      <p>{n}</p>
    {/each}

    <Island __island />

    <!-- <example-element  slots={0} name=""></example-element> -->

    <!-- <fullstack:island slots={''}  on:cl></fullstack:island> -->

    <!-- <svelte:body></svelte:body> -->

    <!-- <Footer count="{5}" /> -->

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
