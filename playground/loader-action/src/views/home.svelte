<script context="module">
  export const loader = () => "loader";
  export const action = () => "action";
</script>

<script lang="ts">
  export let count: number;
  export let data: any;

  let obj = {
    age: 10,
  };

  // const lib: import("../lib/math").MathLib = {};

  // console.log(lib);
</script>

<h1>{data}</h1>

<form action="/" method="post">
  <span data-count="{count}" data-age="{obj.age}">count {count}</span>
  <button>submit</button>
</form>
