#!/usr/bin/env node

import sade from "sade";

import * as codegen from "./generate/index.js";

const prog = sade("fullstack");

prog.command("make:view <name>").action((name) => {
  codegen.write(name, "view");
});

prog.command("make:controller <name>").action((name) => {
  codegen.write(name, "controller");
});

prog.command("make <name>").action((name) => {
  codegen.write(name);
});

prog.parse(process.argv);
