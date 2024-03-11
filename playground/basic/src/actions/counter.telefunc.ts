import { getCount, setCount } from "./count";


// Telefunc ensures that `diff` is a `number` at runtime, see https://telefunc.com/shield#typescript
async function onCounterIncrement(diff: number) {
	const c = getCount() + diff
	setCount(c);
	return c
}

export { onCounterIncrement };