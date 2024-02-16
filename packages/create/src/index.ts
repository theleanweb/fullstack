#!/usr/bin/env node

import fse from "fs-extra";
import * as fs from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as c from "@clack/prompts";

let cwd = process.cwd();

const root = fileURLToPath(new URL("../", import.meta.url));
const templatesDirectory = join(root, "templates");

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

  fse.emptyDirSync(destinationDirectory)
  fse.copySync(templateDirectory, destinationDirectory);
  writePackageMetadata(destinationDirectory, { name: projectName, ...pkg });
}

function getPackageMetadata(dir: string) {
  return JSON.parse(fs.readFileSync(join(dir, "package.json"), "utf-8"));
}

function writePackageMetadata(dir: string, pkg: object) {
  return fse.writeFile(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}
