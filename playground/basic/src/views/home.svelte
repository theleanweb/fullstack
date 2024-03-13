<script lang="ts">
  import Boundary from '../error-boundary/DefaultBoundary.js';
  import Footer from './footer.svelte';
  
	export let count: number;
  export let name: string
</script>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="./script.ts"></script>
  <link rel="stylesheet" href="./main.css">
  <title>Telefunc</title>
</head>
<body>
  <div class="counter bg-red-500">
    <span>Counter: <span class='dis'>{count}</span></span>
    <button data-fallback='0' class='dec'>-1</button>
    <button class='inc'>+1</button>
  </div>
</body>
</html>

<style>
  .dis {
    color: blue;
  }
</style>