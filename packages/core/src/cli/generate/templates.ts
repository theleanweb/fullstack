export const controller = `
import {Hono} from 'hono';

const router = new Hono();

router.put('/', ctx => ctx.html(''));
router.get('/', ctx => ctx.html(''));
router.post('/', ctx => ctx.html(''));
router.get('/:id', ctx => ctx.html(''));
router.delete('/:id', ctx => ctx.html(''));
`

export const list = `
<script>
export let list
</script>
`

export const single = `
<script>
export let item
</script>
`