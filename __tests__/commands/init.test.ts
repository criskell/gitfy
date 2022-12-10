import fs from "fs/promises";
import nodePath from "path";

import { setupFilesystem, TestFilesystem } from "../__support__";
import { init } from "../../src/commands/init";
import { exists } from "../../src/util/filesystem";

describe("commands/init", () => {
  let testFs: TestFilesystem;

  beforeEach(async () => {
    testFs = await setupFilesystem();
  });

  it("deve inicializar um repositório", async () => {
    await init({
      rootDirectory: testFs.repositoryDirectory,
    });

    const git = testFs.gitDirectory;

    expect(await exists(nodePath.join(git, "objects"))).toBe(true);
    expect(await exists(nodePath.join(git, "refs", "heads"))).toBe(true);
    expect(await exists(nodePath.join(git, "refs"))).toBe(true);
    expect(await exists(nodePath.join(git, "HEAD"))).toBe(true);
    expect(await exists(nodePath.join(git, "config"))).toBe(true);
    expect(await exists(nodePath.join(git, "description"))).toBe(true);
  });
});