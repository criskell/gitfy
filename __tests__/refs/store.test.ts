import fs from "fs/promises";
import nodePath from "path";

import { RefStore } from "../../src/refs/store";
import { setupFilesystem } from "../__support__";

describe("refs/store", () => {
  let refStore: RefStore;
  let gitDirectory: string;

  beforeEach(async () => {
    gitDirectory = (
      await setupFilesystem({
        init: true,
      })
    ).gitDirectory;
    refStore = new RefStore(gitDirectory);
  });

  describe("set()", () => {
    it("deve salvar uma referência", async () => {
      await refStore.set("refs/heads/main", "objectid");

      expect(
        await fs.readFile(
          nodePath.join(gitDirectory, "refs", "heads", "main"),
          "ascii"
        )
      ).toBe("objectid\n");
    });
  });

  describe("link()", () => {
    it("deve salvar uma referência simbólica", async () => {
      await refStore.link("HEAD", "refs/heads/main");

      expect(
        await fs.readFile(nodePath.join(gitDirectory, "HEAD"), "ascii")
      ).toBe("ref: refs/heads/main\n");
    });
  });

  describe("resolve()", () => {
    it("deve retornar um id de objeto a partir de uma referência", async () => {
      await fs.writeFile(
        nodePath.join(gitDirectory, "HEAD"),
        "objectid\n",
        "ascii"
      );

      expect(await refStore.resolve("HEAD")).toBe("objectid");
    });

    it("deve retornar um id de objeto a partir de uma referência simbólica", async () => {
      await fs.writeFile(
        nodePath.join(gitDirectory, "HEAD"),
        "ref: refs/heads/main\n",
        "ascii"
      );
      await fs.writeFile(
        nodePath.join(gitDirectory, "refs", "heads", "main"),
        "objectid\n",
        "ascii"
      );

      expect(await refStore.resolve("HEAD")).toBe("objectid");
    });
  });
});
