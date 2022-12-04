import { vol } from "memfs";
import fs from "fs/promises";

import { GitObject } from "../../src/objects";
import { ObjectStore } from "../../src/objects/store";
import { Blob } from "../../src/objects/body/blob";
import { exists } from "../../src/util/filesystem";

jest.mock("fs/promises");

describe("objects/store", () => {
  let store;

  beforeEach(async () => {
    vol.reset();
    await fs.mkdir("/.git/objects", { recursive: true });
    store = new ObjectStore("/.git/objects");
  });

  describe("add()", () => {
    it("deve adicionar um objeto no repositório", async () => {
      const id = (await store.add(GitObject.from(new Blob(Buffer.from("TATAKAE"))))).id;

      const objectExists = await exists(`/.git/objects/${id.slice(0, 2)}/${id.slice(2)}`);

      expect(id).toBeTruthy();
      expect(objectExists).toBe(true);
    });
  });

  describe("get()", () => {
    it("deve retornar um objeto", async () => {
      const object = await store.add(GitObject.from(new Blob(Buffer.from("TATAKAE"))));
      const response = await store.get(object.id);

      expect(response.body).toEqual(object.body);
    });
  });
});
