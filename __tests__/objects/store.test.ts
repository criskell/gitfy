import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectStore } from "../../src/objects/store";
import { Blob } from "../../src/objects/blob";
import { exists } from "../../src/util/filesystem";

jest.mock("fs/promises");

describe("objects/store", () => {
  let store;

  const blob = new Blob();
  blob.content = Buffer.from("TATAKAE");

  beforeEach(async () => {
    vol.reset();
    await fs.mkdir("/.git/objects", { recursive: true });
    store = new ObjectStore("/.git/objects");
  });

  describe("add()", () => {
    it("deve adicionar um objeto no repositório e retornar um identificador", async () => {
      const id = await store.add(blob);

      const objectExists = await exists(
        `/.git/objects/${id.slice(0, 2)}/${id.slice(2)}`
      );

      expect(id).toBeTruthy();
      expect(objectExists).toBe(true);
    });
  });

  describe("get()", () => {
    it("deve retornar um objeto desserializado", async () => {
      const id = await store.add(blob);
      const object = await store.get(id);

      expect(object).toEqual(blob);
    });
  });
});
