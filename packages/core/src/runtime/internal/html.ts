import { uneval } from "devalue";

export function script_json(data: object, { id }: { id?: string }) {
  return `<script id="${id}" type="application/json">${uneval(data)}</script>`;
}
