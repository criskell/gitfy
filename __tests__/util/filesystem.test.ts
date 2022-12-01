import fs from "fs/promises";
import { vol } from "memfs";

import { exists, createTree } from "../../src/util/filesystem";

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

  describe("createTree", () => {
    it("deve criar uma estrutura de diretórios", async () => {
      const cwd = process.cwd();

      await createTree({
        "foo.txt": "bar",
        "bar": {
          "foo.txt": "baz"
        }
      });

      expect(await exists(`${cwd}/foo.txt`)).toBe(true);
      expect(await exists(`${cwd}/bar/foo.txt`)).toBe(true);
      expect(await fs.readFile(`${cwd}/bar/foo.txt`, "utf8")).toBe("baz");
    });
  });
});