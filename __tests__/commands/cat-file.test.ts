import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType } from "../../src/objects/object";
import { ObjectStore } from "../../src/objects/store";
import { Blob } from "../../src/objects/blob";
import { catFile } from "../../src/commands/cat-file";

jest.mock("fs/promises");

describe("commands/cat-file", () => {
  let store;

  const blob = new Blob();
  blob.content = Buffer.from("TATAKAE");

  beforeEach(async () => {
    vol.reset();
    await fs.mkdir("/.git/objects", { recursive: true });
    store = new ObjectStore("/.git/objects");
  });

  it("deve obter a versão crua de um objeto blob", async () => {
    const id = await store.add(blob);

    const response = await catFile(store)({
      type: ObjectType.BLOB,
      objectId: id,
    });

    expect(response).toHaveProperty("body", Buffer.from("TATAKAE"));
  });
});