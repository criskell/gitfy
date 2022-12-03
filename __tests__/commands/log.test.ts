import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType, generateObjectId } from "../../src/objects/object";
import { ObjectStore } from "../../src/objects/store";
import { log } from "../../src/commands/log";

jest.mock("fs/promises");

describe("commands/log", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("deve mostrar um log de commits", async () => {
    await fs.mkdir("/.git/objects", { recursive: true });

    const store = new ObjectStore("/.git/objects");

    const firstCommit = await store.add({
      type: ObjectType.COMMIT,
      parentIds: [],
      treeId: generateObjectId("exampletreeid" as any),
      author: "foo",
      committer: "foo",
      message: "TATAKAE",
    });

    const secondCommit = await store.add({
      type: ObjectType.COMMIT,
      parentIds: [firstCommit],
      treeId: generateObjectId("exampletreeid" as any),
      author: "foo",
      committer: "foo",
      message: "FOO",
    });

    const response = await log(store)({ commitId: secondCommit });

    expect(response.log).toBe(`digraph {${secondCommit.slice(0, 6)}->${firstCommit.slice(0, 6)}}`);
  });
});