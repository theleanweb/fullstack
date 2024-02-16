#!/usr/bin/env node

import fse from "fs-extra";
import * as fs from "node:fs";
import { basename, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

import color from "kleur";

import pkg from "../package.json" assert { type: "json" };

import * as c from "@clack/prompts";

const root = fileURLToPath(new URL("../", import.meta.url));
const templatesDirectory = join(root, "templates");

console.log(`
${color.grey(`${pkg.name} version ${pkg.version}`)}
`);

let cwd = process.cwd();

let directory = await c.text({
  message: "Project directory",
  placeholder: "Hit enter to use the current directory",
});

if (c.isCancel(directory)) process.exit(1);

if (directory) {
  cwd = directory;
}

if (fs.existsSync(cwd)) {
  if (fs.readdirSync(cwd).length > 0) {
    const useNomEmptydir = await c.confirm({
      initialValue: false,
      message: "Directory not empty, continue?",
    });

    if (c.isCancel(useNomEmptydir) || !useNomEmptydir) {
      process.exit(1);
    }
  }
}

const projectName = basename(resolve(cwd));

create({ projectName, directory });

c.outro("Your project is ready!");

console.log("\nNext steps:");

let i = 1;

const workspace = relative(process.cwd(), cwd);
const package_manager = getPackageManager() || "npm";

if (workspace !== "") {
  console.log(`  ${i++}) ${color.bold(color.cyan(`cd ${workspace}`))}`);
}

console.log(
  `  ${i++}) ${color.bold(color.cyan(`${package_manager} install`))}`
);

// prettier-ignore
console.log(`  ${i++}) ${color.bold(color.cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`);

console.log(
  `  ${i++}) ${color.bold(color.cyan(`${package_manager} run dev -- --open`))}`
);

function create({
  directory,
  projectName,
}: {
  directory: string;
  projectName: string;
}) {
  const destinationDirectory = join(directory);
  const templateDirectory = join(templatesDirectory, "default");

  const { name: _, ...pkg } = getPackageMetadata(templateDirectory);

  fse.emptyDirSync(destinationDirectory);
  fse.copySync(templateDirectory, destinationDirectory);
  writePackageMetadata(destinationDirectory, { name: projectName, ...pkg });
}

function getPackageMetadata(dir: string) {
  return JSON.parse(fs.readFileSync(join(dir, "package.json"), "utf-8"));
}

function writePackageMetadata(dir: string, pkg: object) {
  return fse.writeFile(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}

function getPackageManager() {
  if (!process.env.npm_config_user_agent) {
    return undefined;
  }
  const user_agent = process.env.npm_config_user_agent;
  const pm_spec = user_agent.split(" ")[0];
  const separator_pos = pm_spec.lastIndexOf("/");
  const name = pm_spec.substring(0, separator_pos);
  return name === "npminstall" ? "cnpm" : name;
}
