import { vol } from "memfs";
import fs from "fs/promises";

import { ObjectType } from "../../src/objects";
import { hashObject } from "../../src/commands/hash-object";

jest.mock("fs/promises");

describe("commands/hash-object", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("deve converter os dados fornecidos em um objeto Git e retornar um identificador", async () => {
    const response = await hashObject()({
      type: ObjectType.BLOB,
      body: Buffer.from("AAAAAA"),
      write: false,
    });

    expect(response).toHaveProperty("id");
  });
});