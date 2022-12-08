import fs from "fs/promises";
import mockfs from "mock-fs";
import nodePath from "path";
import os from "os";
import crypto from "crypto";
import util from "util";

import { Repository, loadRepository } from "../../src/repository";
import { createTree } from "../../src/util/filesystem";
import { init } from "../../src/commands/init";

const FIXTURES_PATH = nodePath.join(__dirname, "fixtures");
const TESTDATA_PATH = nodePath.join(__dirname, "testdata");

type TestRepository = Repository & {
  restore(): Promise<void>;
};

type SetupTestRepoParams = {
  isBare?: boolean;
  tree?: object;
  mockFs?: boolean;
  testName?: string;
  datadir?: boolean;
};

const randomBytes = util.promisify(crypto.randomBytes);

export const fixturePath = (fixture: string) => {
  return nodePath.join(FIXTURES_PATH, fixture);
};

export const setupFs = ({ mock = false }: { mock?: boolean } = {}) => {
  beforeEach(() => {
    if (mock)
      mockfs();
  });

  afterEach(() => {
    restoreTests();
  });
}

export const setupTestRepo = async (params: SetupTestRepoParams): Promise<TestRepository> => {
  const parentPath = params.datadir ? TESTDATA_PATH : os.tmpdir();
  const testName = params.testName ? params.testName.replace("/", "-") : "";
  const dirName = (await randomBytes(10)).toString("hex") + testName;
  const repoPath = nodePath.join(parentPath, dirName);

  params.mockFs ??= true;

  if (params.mockFs) {
    mockfs();
  }

  await init({ rootDirectory: repoPath, isBare: Boolean(params.isBare) });

  if (params.tree) {
    await createTree(params.tree as any, repoPath);
  }

  const repository: TestRepository = Object.assign(await loadRepository(repoPath), {
    async restore () {
      restoreTests();
    }
  });

  return repository;
};

export const restoreTests = () => {
  mockfs.restore();
};