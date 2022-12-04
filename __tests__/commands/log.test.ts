import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType, generateObjectId } from "../../src/objects/object";
import { ObjectStore } from "../../src/objects/store";
import { Commit } from "../../src/objects/commit";
import { log } from "../../src/commands/log";

jest.mock("fs/promises");

describe("commands/log", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("deve mostrar um log de commits", async () => {
    await fs.mkdir("/.git/objects", { recursive: true });
    const store = new ObjectStore("/.git/objects");

    const firstCommit = new Commit();

    firstCommit.parentIds = [];
    firstCommit.treeId = generateObjectId(Buffer.from("exampletreeid"));
    firstCommit.author = "foo";
    firstCommit.committer = "foo";
    firstCommit.message = "first commit";

    const firstCommitId = await store.add(firstCommit);

    const secondCommit = new Commit();

    secondCommit.parentIds = [firstCommitId];
    secondCommit.treeId = generateObjectId(Buffer.from("exampletreeid"));
    secondCommit.author = "foo";
    secondCommit.committer = "foo";
    secondCommit.message = "second commit";

    const secondCommitId = await store.add(secondCommit);

    const response = await log(store)({ commitId: secondCommitId });

    expect(response.log).toBe(`digraph {${secondCommitId.slice(0, 6)}->${firstCommitId.slice(0, 6)}}`);
  });
});