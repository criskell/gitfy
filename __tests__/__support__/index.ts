import fs from "fs/promises";
import mockfs from "mock-fs";
import nodePath from "path";
import os from "os";
import crypto from "crypto";
import util from "util";

import { Repository, loadRepository } from "../../src/repository";
import { init } from "../../src/commands/init";

const FIXTURES_PATH = nodePath.join(__dirname, "fixtures");

type TestRepository = Repository & {
  restore(): Promise<void>;
};

type SetupTestRepoParams = {
  isBare?: boolean;
  tree?: object;
};

const randomBytes = util.promisify(crypto.randomBytes);

export const setup = () => {
  afterEach(() => {
    mockfs.restore();
  });
}

export const setupTestRepo = async (params: SetupTestRepoParams): Promise<TestRepository> => {
  const dirName = (await randomBytes(10)).toString("hex");
  const repoPath = nodePath.join(os.tmpdir(), dirName);

  if (params.tree) {
    params.tree = Object.fromEntries(
      Object.entries(params.tree)
        .map(([path, content]) => [nodePath.join(repoPath, path), content])
    );
  }

  mockfs(params.tree);

  await init({ rootDirectory: repoPath, isBare: params.isBare });
  const repository: TestRepository = Object.assign(await loadRepository(repoPath), {
    async restore () {
      mockfs.restore();
    }
  });

  return repository;
};