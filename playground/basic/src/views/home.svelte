<script lang="ts">
	export let count: number;
</script>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="./script.ts"></script>
  <title>Telefunc</title>
</head>
<body>
  <div class="counter">
    <span>Counter: <span class='dis'>{count}</span></span>
    <button class='dec'>-1</button>
    <button class='inc'>+1</button>
  </div>
</body>
</html>