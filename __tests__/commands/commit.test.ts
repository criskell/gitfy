import fs from "fs/promises";
import nodePath from "path";

import { setupRepository } from "../__support__";
import { checkout } from "../../src/commands/checkout";

describe("commands/commit", () => {
  it("deve criar um commit com uma tree gerada do índice", async () => {
    const repo = await setupRepository({
      tree: {
        "foo.txt": "fu",
        bar: {
          test: {
            "a.txt": "fuu",
          },
        },
      },
      testName: "commit",
    });

    await repo.add({ path: "foo.txt" });
    await repo.add({ path: "bar/test/a.txt" });

    const response = await repo.commit({ message: "blabla", author: "lol" });

    await fs.rm(nodePath.join(repo.path.root, "foo.txt"));
    await fs.rm(nodePath.join(repo.path.root, "bar/test/a.txt"));

    const workingTreePath = nodePath.join(
      nodePath.dirname(repo.path.root),
      "working-tree"
    );

    await checkout(repo.objectStore)({
      commitId: response.commitId,
      workingTreePath,
    });

    expect(
      await fs.readFile(nodePath.join(workingTreePath, "foo.txt"), "utf8")
    ).toBe("fu");
    expect(
      await fs.readFile(
        nodePath.join(workingTreePath, "bar/test/a.txt"),
        "utf8"
      )
    ).toBe("fuu");
  });
});
