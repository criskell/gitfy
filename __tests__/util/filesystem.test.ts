import fs from "fs/promises";
import nodePath from "path";

import { setupFilesystem, TestFilesystem } from "../__support__";
import { exists, createTree, listFiles } from "../../src/util/filesystem";

describe("util/filesystem", () => {
  let testFs: TestFilesystem;

  beforeEach(async () => {
    testFs = await setupFilesystem();
  });

  describe("exists", () => {
    it.only("deve retornar true se um diretório existe", async () => {
      const path = nodePath.join(testFs.testDirectory, "foo.txt");
      await fs.writeFile(path, "");
      expect(await exists(path)).toBe(true);
    });

    it("deve retornar false se um diretório não existe", async () => {
      const path = nodePath.join(testFs.testDirectory, "bar.txt");
      expect(await exists(path)).toBe(false);
    });
  });

  describe("createTree", () => {
    it("deve criar uma estrutura de diretórios", async () => {
      const cwd = testFs.testDirectory;

      await createTree(
        {
          "foo.txt": "bar",
          bar: {
            "foo.txt": "baz",
          },
        },
        cwd
      );

      expect(await exists(`${cwd}/foo.txt`)).toBe(true);
      expect(await exists(`${cwd}/bar/foo.txt`)).toBe(true);
      expect(await fs.readFile(`${cwd}/bar/foo.txt`, "utf8")).toBe("baz");
    });
  });

  describe("listFiles()", () => {
    it("deve listar recursivamente os arquivos de um diretório", async () => {
      await createTree(
        {
          "foo.txt": "a",
          b: {
            c: {
              d: "f",
              g: "h",
              y: "k",
              a: {
                b: "2",
              },
            },
          },
        },
        "/diretorio"
      );

      const files = await listFiles(testFs.testDirectory);

      expect(files).toEqual(
        expect.arrayContaining([
          nodePath.join(testFs.testDirectory, "foo.txt"),
          nodePath.join(testFs.testDirectory, "b", "c", "d"),
          nodePath.join(testFs.testDirectory, "b", "c", "g"),
          nodePath.join(testFs.testDirectory, "b", "c", "y"),
          nodePath.join(testFs.testDirectory, "b", "c", "a", "b"),
        ])
      );
    });
  });
});
