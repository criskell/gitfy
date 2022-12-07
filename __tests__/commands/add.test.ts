import fs from "fs/promises";
import mockfs from "mock-fs";

import { add } from "../../src/commands/add";
import { ObjectStore } from "../../src/objects";
import { IndexStore } from "../../src/staging";

describe("commands/add", () => {
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

  it("deve adicionar um arquivo no índice", async () => {
    await fs.writeFile("/repo/foo.txt", "Foo");

    await add({
      rootDirectory: "/repo",
      objectStore,
      indexStore,
      path: "foo.txt",
    });

    await indexStore.reload();

    const entries = indexStore.index.entries();

    expect(entries.length).toBe(1);
    expect(entries[0]).toHaveProperty("file.path", "foo.txt");

    const blobObject = await objectStore.get(entries[0].objectId);

    expect(blobObject).toBeDefined();
    expect(blobObject.body().content).toEqual(Buffer.from("Foo"));
  });
});