import { Command, Option } from "clipanion";
import * as path from 'node:path'

import * as tmpl from './templates'

const VIEWS_DIRECTORY = 'src/views/pages'
const CONTROLLERS_DIRECTORY = 'src/controllers'

export class GenerateCommand extends Command {
  static paths = [["g", "generate"]];

  name = Option.String();

  async execute() {
    const cwd = process.cwd();
    const view = path.join(cwd, VIEWS_DIRECTORY, this.name)
    const controller = path.join(cwd, CONTROLLERS_DIRECTORY, this.name)
  }
}
