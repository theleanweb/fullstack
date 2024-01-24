import { parse, stringify } from "devalue";

export function script_json(data: object, { id }: { id?: string }) {
  const content = stringify(data);
  return `<script id="${id}" type="application/json">${content}</script>`;
}

export function get_script_json(id: string): object | null {
  const element = document.getElementById(id);
  const content = element?.textContent;
  return content ? parse(content) : null;
}
