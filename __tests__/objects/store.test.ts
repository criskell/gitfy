import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType } from "../../src/objects/object";
import { ObjectStore } from "../../src/objects/store";
import { exists } from "../../src/util/filesystem";

jest.mock("fs/promises");

describe("objects/store", () => {
  beforeEach(() => {
    vol.reset();
  });

  describe("add()", () => {
    it("deve adicionar um objeto no repositório e retornar um identificador", async () => {
      await fs.mkdir("/.git/objects", { recursive: true });

      const store = new ObjectStore("/.git/objects");

      const id = await store.add({
        type: ObjectType.BLOB,
        content: Buffer.from("TATAKAE"),
      });

      const objectExists = await exists(
        `/.git/objects/${id.slice(0, 2)}/${id.slice(2)}`
      );

      expect(id).toBeTruthy();
      expect(objectExists).toBe(true);
    });
  });

  describe("get()", () => {
    it("deve retornar um objeto desencapsulado", async () => {
      await fs.mkdir("/.git/objects", { recursive: true });

      const store = new ObjectStore("/.git/objects");

      const id = await store.add({
        type: ObjectType.BLOB,
        content: Buffer.from("TATAKAE"),
      });
      const unwrapped = await store.get(id);

      expect(unwrapped).toEqual({
        type: ObjectType.BLOB,
        content: Buffer.from("TATAKAE"),
      });
    });
  });
});
