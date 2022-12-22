import { setupRepository } from "../__support__";

describe("commands/remote", () => {
  describe("addRemote", () => {
    it("deve adicionar um remoto", async () => {
      const repo = await setupRepository();

      await repo.commands.addRemote({
        remoteName: "origin",
        url: "https://example.com/any-repository-url.git",
      });

      expect(repo.config.data).toHaveProperty("remote.origin", {
        url: "https://example.com/any-repository-url.git",
        fetch: "+refs/heads/*:refs/remotes/origin/*",
      });
    });
  });

  describe("removeRemote", () => {
    it("deve remover um remoto", async () => {
      const repo = await setupRepository();

      repo.config.data.remote = {
        origin: {
          url: "https://example.com/any-repository-url.git",
          fetch: "+refs/heads/*:refs/remotes/origin/*",
        },        
      };

      await repo.commands.removeRemote({ remoteName: "origin" });

      expect(repo.config.data).not.toHaveProperty("remote.origin");
    });
  });
});