import { onCounterIncrement } from "../actions/counter.telefunc"

const dis = document.querySelector('.dis')
const inc = document.querySelector('.inc')
const dec = document.querySelector('.dec')

inc?.addEventListener('click', async () => {
    const r = await onCounterIncrement(+1)
    dis!.textContent = r.toString()
})

dec?.addEventListener('click', async () => {
    const r = await onCounterIncrement(-1)
    dis!.textContent = r.toString()
})