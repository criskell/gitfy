import fs from "fs/promises";
import mockfs from "mock-fs";
import nodePath from "path";
import os from "os";
import crypto from "crypto";
import util from "util";

import { Repository, loadRepository } from "../../src/repository";
import { Tree, createTree } from "../../src/util/filesystem";
import { init } from "../../src/commands/init";

const randomBytes = util.promisify(crypto.randomBytes);

const FIXTURES_PATH = nodePath.join(__dirname, "fixtures");
const RUNS_PATH = nodePath.join(__dirname, "runs");

export const fixturePath = (fixture: string) => {
  return nodePath.join(FIXTURES_PATH, fixture);
};

export interface TestFilesystem {
  testDirectory: string;
  repositoryDirectory: string;
  gitDirectory: string;
}

export const setupFilesystem = async (
  options: {
    testName?: string;
    saveTemporary?: boolean;
    tree?: Tree;
    mock?: boolean;
    init?: boolean;
    isBare?: boolean;
  } = {}
): Promise<TestFilesystem> => {
  options.saveTemporary ??= !Boolean(
    process.env.GITFY_REAL_FILESYSTEM || false
  );
  options.mock ??= !Boolean(process.env.GITFY_REAL_FILESYSTEM || false);
  options.init ??= false;
  options.isBare ??= false;

  const runsDirectory = options.saveTemporary
    ? nodePath.join(os.tmpdir(), "gitfy-runs")
    : RUNS_PATH;
  const id = (await randomBytes(10)).toString("hex");
  const runName = `${options.testName ? options.testName + "-" : ""}${new Date()
    .toLocaleString()
    .replace(/\/|:| /g, "_")}_${id}`;

  const testDirectory = nodePath.join(runsDirectory, runName);
  const repositoryDirectory = nodePath.join(testDirectory, "repository");
  const gitDirectory = options.isBare
    ? repositoryDirectory
    : nodePath.join(repositoryDirectory, ".git");

  if (options.mock) {
    mockfs();
  }

  await fs.mkdir(gitDirectory, { recursive: true });

  if (options.tree) {
    await createTree(
      options.tree,
      options.isBare ? testDirectory : repositoryDirectory
    );
  }

  if (options.init) {
    await init({
      isBare: options.isBare,
      rootDirectory: repositoryDirectory,
    });
  }

  return {
    gitDirectory,
    testDirectory,
    repositoryDirectory,
  };
};

export const setupRepository = async (
  options: Parameters<typeof setupFilesystem>[0]
): Promise<Repository> => {
  options.init = true;

  const { repositoryDirectory } = await setupFilesystem(options);
  return loadRepository(repositoryDirectory);
};
