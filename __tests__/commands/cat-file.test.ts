import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType } from "../../src/objects/object";
import { ObjectStore } from "../../src/objects/store";
import { catFile } from "../../src/commands/cat-file";

jest.mock("fs/promises");

describe("commands/cat-file", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("deve obter a versão crua de um objeto blob", async () => {
    await fs.mkdir("/.git/objects", { recursive: true });

    const store = new ObjectStore("/.git/objects");

    const id = await store.add({
      type: ObjectType.BLOB,
      content: Buffer.from("TATAKAE"),
    });

    const response = await catFile(store)({ type: ObjectType.BLOB, objectId: id });

    expect(response).toHaveProperty("body", Buffer.from("TATAKAE"));
  });
});