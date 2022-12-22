import nodePath from "path";

import { setupRepository } from "../__support__";
import { exists } from "../../src/util/filesystem";

describe("commands/branch", () => {
  describe("renameBranch", () => {
    it("deve renomear uma branch", async () => {
      const repo = await setupRepository({
        tree: {
          ".git": {
            "refs": {
              "heads": {
                "master": "anyobjectid\n",
              },
            },
          },
        },
      });

      await repo.commands.renameBranch({
        branchName: "master",
        targetName: "main",
      });

      expect(await exists(nodePath.join(repo.path.git, "refs", "heads", "master"))).toBe(false);
      expect(await exists(nodePath.join(repo.path.git, "refs", "heads", "main"))).toBe(true);
    });
  });
});