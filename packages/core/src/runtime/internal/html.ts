import { uneval } from "devalue";

export function script_json(data: object) {
  return `<script id="data" type="application/json">${uneval(data)}</script>`;
}
