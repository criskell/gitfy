import { vol } from "memfs";
import fs from "fs/promises";

import { loadRepository } from "../../src/util/repository";
import { init } from "../../src/commands/init";

jest.mock("fs/promises");

describe("util/repository", () => {
  beforeEach(() => {
    vol.reset();
    vol.mkdirSync(process.cwd(), { recursive: true });
  });

  describe("loadRepository", () => {
    it("deve carregar um repositório", async () => {
      await init();
      const repo = await loadRepository();
      expect(repo.config).toHaveProperty("core.bare", false);
    });

    it("deve carregar um repositório bare", async () => {
      await init({
        isBare: true
      });
      const repo = await loadRepository();
      expect(repo.config).toHaveProperty("core.bare", true);
    });
  });
});