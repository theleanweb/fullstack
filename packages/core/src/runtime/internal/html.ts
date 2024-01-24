import { uneval } from "devalue";

export function script_json(data: object, { id }: { id?: string }) {
  return `<script id="${id}" type="application/json">${uneval(data)}</script>`;
}

export function get_script_json(id: string): object | null {
  const element = document.getElementById(id);
  const content = element?.textContent;
  return content ? JSON.parse(content) : null;
}
