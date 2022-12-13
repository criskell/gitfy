import fs from "fs/promises";

import { setupFilesystem } from "../__support__";
import { exists } from "../../src/util/filesystem";
import { RefStore } from "../../src/refs/store";

describe("refs/store", () => {
  describe("RefStore", () => {
    describe("#resolve()", () => {
      let testFilesystem;
      let refStore;

      beforeEach(async () => {
        testFilesystem = await setupFilesystem({
          tree: {
            ".git": {
              "refs": {
                "examples": {
                  "sym0": "ref: refs/examples/sym1\n",
                  "sym1": "ref: refs/examples/sym2\n",
                  "sym2": "ref: refs/examples/direct0\n",
                  "direct0": "randomid\n",
                },
              },
            },
          },
        });

        refStore = new RefStore(testFilesystem.gitDirectory);
      });

      it("deve resolver uma referência simbólica para uma referência direta", async () => {
        expect(await refStore.resolve("refs/examples/sym0")).toStrictEqual({
          name: "refs/examples/direct0",
          symbolic: false,
          value: "randomid",
        });
      });

      it("deve respeitar a profundidade máxima especificada", async () => {
        expect(await refStore.resolve("refs/examples/sym0", {
          maxDepth: 3
        })).toBeNull();
      });

      it("deve respeitar a profundidade mínima especificada", async () => {
        expect(await refStore.resolve("refs/examples/direct0", {
          minDepth: 2
        })).toBeNull();
      });
    });

    describe("#save()", () => {
      let testFilesystem;
      let refStore;

      beforeEach(async () => {
        testFilesystem = await setupFilesystem();
        refStore = new RefStore(testFilesystem.gitDirectory);
      });

      it("deve salvar uma referência direta", async () => {
        await refStore.save({
          name: "refs/heads/main",
          value: "objectid",
        });

        expect(await fs.readFile(`${testFilesystem.gitDirectory}/refs/heads/main`, "ascii")).toBe("objectid\n");
      });

      it("deve salvar uma referência simbólica", async () => {
        await refStore.save({
          name: "refs/heads/main",
          value: "refs/heads/master",
          symbolic: true,
        });

        expect(await fs.readFile(`${testFilesystem.gitDirectory}/refs/heads/main`, "ascii")).toBe("ref: refs/heads/master\n");
      });
    });

    describe("#remove()", () => {
      it("deve remover uma referência", async () => {
        const testFilesystem = await setupFilesystem({
          tree: {
            ".git": {
              "HEAD": "biojweriojheriojt"
            }
          }
        });
        const refStore = new RefStore(testFilesystem.gitDirectory);

        await refStore.remove("HEAD");

        expect(await exists(`${testFilesystem.gitDirectory}/HEAD`)).toBe(false);
      });
    });

    describe("#rename()", () => {
      it("deve renomear uma referência", async () => {
        const testFilesystem = await setupFilesystem({
          tree: {
            ".git": {
              "HEAD": "biojweriojheriojt"
            }
          }
        });
        const refStore = new RefStore(testFilesystem.gitDirectory);

        await refStore.rename("HEAD", "MYHEAD");

        expect(await exists(`${testFilesystem.gitDirectory}/HEAD`)).toBe(false);
        expect(await fs.readFile(`${testFilesystem.gitDirectory}/MYHEAD`, "ascii")).toBe("biojweriojheriojt");
      });
    });

    describe("#list()", () => {
      it("deve listar referências existentes", async () => {
        const testFilesystem = await setupFilesystem({
          tree: {
            ".git": {
              "refs": {
                "heads": {
                  "main": "etletr",
                  "master": "etertewrewr"
                },
                "tags": {
                  "v1": "0"
                }
              },
            },
          },
        });

        const refStore = new RefStore(testFilesystem.gitDirectory);

        expect(await refStore.list({ dir: "heads" })).toStrictEqual([
          "refs/heads/main",
          "refs/heads/master",
        ]);
      });
    });
  });
});