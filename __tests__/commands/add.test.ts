import fs from "fs/promises";
import mockfs from "mock-fs";

import { setupFs, setupTestRepo } from "../__support__";
import { add } from "../../src/commands/add";
import { ObjectType } from "../../src/objects";

setupFs();

describe("commands/add", () => {
  it("deve adicionar um arquivo no índice", async () => {
    const repo = await setupTestRepo({
      tree: {
        "foo.txt": "Foo"
      }
    });

    await repo.add({ path: "foo.txt" });

    await repo.indexStore.reload();

    const entries = repo.indexStore.index.entries();

    expect(entries.length).toBe(1);
    expect(entries[0]).toHaveProperty("file.path", "foo.txt");

    const blobObject = await repo.objectStore.get(entries[0].objectId);

    expect(blobObject).toBeDefined();

    const blob = blobObject.body() as any;

    expect(blob.type).toBe(ObjectType.BLOB);
    expect(blob.content).toEqual(Buffer.from("Foo"));

    repo.restore();
  });
});