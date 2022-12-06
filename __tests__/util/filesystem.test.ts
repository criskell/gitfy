import fs from "fs/promises";

import { setupFs } from "../support";
import { exists, createTree, listFiles } from "../../src/util/filesystem";

jest.mock("fs/promises");
setupFs();

describe("util/filesystem", () => {
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

  describe("listFiles()", () => {
    it("deve listar recursivamente os arquivos de um diretório", async () => {
      await createTree({
        "foo.txt": "a",
        "b": {
          "c": {
            "d": "f",
            "g": "h",
            "y": "k",
            "a": {
              "b": "2"
            }
          }
        }
      }, "/diretorio");

      const files = await listFiles("/diretorio");

      expect(files).toEqual(expect.arrayContaining([
        "/diretorio/foo.txt",
        "/diretorio/b/c/d",
        "/diretorio/b/c/g",
        "/diretorio/b/c/y",
        "/diretorio/b/c/a/b",
      ]));
    });
  });
});