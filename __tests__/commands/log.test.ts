import { vol } from "memfs";
import fs from "fs/promises";

import { GitObject, generateObjectId } from "../../src/objects";
import { ObjectStore } from "../../src/objects/store";
import { Commit } from "../../src/objects/body/commit";
import { log } from "../../src/commands/log";

jest.mock("fs/promises");

describe("commands/log", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("deve mostrar um log de commits", async () => {
    await fs.mkdir("/.git/objects", { recursive: true });
    const store = new ObjectStore("/.git/objects");

    const firstCommit = await store.add(GitObject.from(new Commit(
      "first commit msg",
      generateObjectId(Buffer.from("exampletreeid")),
      "foo author",
    )));

    const secondCommit = await store.add(GitObject.from(new Commit(
      "second commit msg",
      generateObjectId(Buffer.from("exampletreeid2")),
      "foo author",
      [firstCommit.id],
    )));

    const response = await log(store)({ commitId: secondCommit.id });

    expect(response.log).toBe(`digraph {${secondCommit.id.slice(0, 6)}->${firstCommit.id.slice(0, 6)}}`);
  });
});