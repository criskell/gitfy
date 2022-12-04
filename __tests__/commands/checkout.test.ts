import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType } from "../../src/objects/object";
import { ObjectStore } from "../../src/objects/store";
import { Blob } from "../../src/objects/blob";
import { Commit } from "../../src/objects/commit";
import { Tree, TreeEntry } from "../../src/objects/tree";
import { checkout } from "../../src/commands/checkout";

jest.mock("fs/promises");

const generateTreeFixture = async (store) => {
  const blob1 = new Blob();
  blob1.content = Buffer.from("BLOB1");

  const blob2 = new Blob();
  blob2.content = Buffer.from("BLOB2");

  const blob1Id = await store.add(blob1);
  const blob2Id = await store.add(blob2);

  const blob1Entry = new TreeEntry();
  blob1Entry.mode = "100644";
  blob1Entry.path = "blob1.txt";
  blob1Entry.objectId = blob1Id;

  const blob2Entry = new TreeEntry();
  blob2Entry.mode = "100644";
  blob2Entry.path = "blob2.txt";
  blob2Entry.objectId = blob2Id;

  const subtree1 = new Tree();
  subtree1.entries.push(blob1Entry);
  const subtree1Id = await store.add(subtree1);

  const subtree1Entry = new TreeEntry();
  subtree1Entry.mode = "040000";
  subtree1Entry.path = "subtree1";
  subtree1Entry.objectId = subtree1Id;

  const rootTree = new Tree();

  rootTree.entries.push(blob1Entry);
  rootTree.entries.push(blob2Entry);
  rootTree.entries.push(subtree1Entry);

  return await store.add(rootTree);
};

const generateCommitFixture = async (store, treeId) => {
  const commit = new Commit();

  commit.parentIds = [];
  commit.treeId = treeId;
  commit.author = "foo";
  commit.committer = "foo";
  commit.message = "first commit";

  return store.add(commit);
};

describe("commands/checkout", () => {
  let store;
  let treeId;
  let commitId;

  beforeEach(async () => {
    vol.reset();
    await fs.mkdir("/.git/objects", { recursive: true });
    store = new ObjectStore("/.git/objects");
    treeId = await generateTreeFixture(store);
    commitId = await generateCommitFixture(store, treeId);
  });

  it("deve extrair o conteúdo de um commit", async () => {
    await checkout(store)({
      workingTreePath: "/",
      commitId,
    });

    expect(await fs.readFile("/blob1.txt", "utf8")).toBe("BLOB1");
    expect(await fs.readFile("/blob2.txt", "utf8")).toBe("BLOB2");
    expect(await fs.readFile("/subtree1/blob1.txt", "utf8")).toBe("BLOB1");
  });
});