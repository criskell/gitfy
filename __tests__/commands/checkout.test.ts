import { vol } from "memfs";
import fs from "fs/promises";

import { GitObject } from "../../src/objects";
import { ObjectStore } from "../../src/objects/store";
import { Blob } from "../../src/objects/body/blob";
import { Commit } from "../../src/objects/body/commit";
import { Tree, TreeEntry } from "../../src/objects/body/tree";
import { checkout } from "../../src/commands/checkout";

jest.mock("fs/promises");

const generateTreeFixture = async (store) => {
  const fileEntries = [
    new TreeEntry(
      "100644",
      "blob1.txt",
      (await store.add(GitObject.from(new Blob(Buffer.from("BLOB1"))))).id,
    ),
    new TreeEntry(
      "100644",
      "blob2.txt",
      (await store.add(GitObject.from(new Blob(Buffer.from("BLOB2"))))).id,
    ),
  ];

  return (await store.add(GitObject.from(new Tree([
    ...fileEntries,
    new TreeEntry(
      "040000",
      "subtree1",
      (await store.add(GitObject.from(new Tree([fileEntries[0]])))).id,
    )
  ])))).id;
};

const generateCommitFixture = async (store, treeId) => {
  return (await store.add(GitObject.from(new Commit(
    "first commit",
    treeId,
    "foo",
  )))).id;
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