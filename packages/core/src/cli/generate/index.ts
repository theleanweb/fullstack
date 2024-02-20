import { Command, Option } from "clipanion";
import * as path from "node:path";
import * as fs from "node:fs";

import * as tmpl from "./templates";

const VIEWS_DIRECTORY = "src/views/pages";
const CONTROLLERS_DIRECTORY = "src/controllers";

export class GenerateCommand extends Command {
  static paths = [["g", "generate"]];

  name = Option.String();

  async execute() {
    const cwd = process.cwd();
    const view = path.join(cwd, VIEWS_DIRECTORY, this.name);
    const controller = path.join(cwd, CONTROLLERS_DIRECTORY, this.name);

    const views = {
      "index.svelte": tmpl.index(this.name),
      "show.svelte": tmpl.show(this.name),
      "new.svelte": tmpl.new_,
    };

    fs.writeFileSync(
      path.join(controller, `${this.name}.controller.ts`),
      tmpl.controller(this.name)
    );

    for (const name in views) {
      const k = name as keyof typeof views;
      fs.writeFileSync(path.join(view, name), views[k]);
    }

    fs.writeFileSync(path.join(controller, "utils.ts"), tmpl.utils(this.name));
  }
}
