import fs from "fs/promises";
import { vol } from "memfs";

import { exists } from "../../src/util/filesystem";

jest.mock("fs/promises");

describe("util/filesystem", () => {
  beforeEach(() => {
    vol.reset();
  });

  describe("exists", () => {
    it("deve retornar true se um diretório existe", async () => {
      await fs.writeFile("/foo.txt", "");
      expect(await exists("/foo.txt")).toBe(true);
    });

    it("deve retornar false se um diretório não existe", async () => {
      expect(await exists("/bar.txt")).toBe(false);
    });
  });
});