import { vol } from "memfs";
import fs from "fs/promises";

import { GitObject, ObjectType } from "../../src/objects";
import { ObjectStore } from "../../src/objects/store";
import { Blob } from "../../src/objects/body/blob";
import { catFile } from "../../src/commands/cat-file";

jest.mock("fs/promises");

describe("commands/cat-file", () => {
  let store;

  beforeEach(async () => {
    vol.reset();
    await fs.mkdir("/.git/objects", { recursive: true });
    store = new ObjectStore("/.git/objects");
  });

  it("deve obter a versão crua de um objeto blob", async () => {
    const object = await store.add(GitObject.from(new Blob(Buffer.from("TATAKAE"))));

    const response = await catFile(store)({
      type: ObjectType.BLOB,
      objectId: object.id,
    });

    expect(response).toHaveProperty("body", Buffer.from("TATAKAE"));
  });
});