import fs from "fs/promises";
import mockfs from "mock-fs";

import { createTree } from "../../src/util/filesystem";
import { add } from "../../src/commands/add";
import { commit } from "../../src/commands/commit";
import { checkout } from "../../src/commands/checkout";
import { ObjectStore } from "../../src/objects";
import { IndexStore } from "../../src/staging";

describe("commands/commit", () => {
  let objectStore;
  let indexStore;

  beforeEach(async () => {
    mockfs();

    await fs.mkdir("/repo");

    objectStore = new ObjectStore("/repo/.git/objects");
    indexStore = await IndexStore.from("/repo/.git/index");
  });

  afterEach(() => {
    mockfs.restore();
  });

  it("deve criar um commit com uma tree gerada do índice", async () => {
    await createTree(
      {
        "foo.txt": "fu",
        bar: {
          test: {
            "a.txt": "fuu",
          },
        },
      },
      "/repo"
    );

    await add({
      rootDirectory: "/repo",
      objectStore,
      indexStore,
      path: "."
    });

    const response = await commit({
      objectStore,
      indexStore,
      message: "blabla",
      author: "lol",
    });

    await fs.rm("/repo/foo.txt");
    await fs.rm("/repo/bar/test/a.txt");

    await checkout(objectStore)({
      commitId: response.commitId,
      workingTreePath: "/working-tree",
    });

    expect(await fs.readFile("/working-tree/foo.txt", "utf8")).toBe("fu");
    expect(await fs.readFile("/working-tree/bar/test/a.txt", "utf8")).toBe(
      "fuu"
    );
  });
});
