import { setupRepository } from "../__support__";

describe("commands/add", () => {
  it("deve adicionar um arquivo no índice", async () => {
    const repo = await setupRepository({
      tree: {
        "foo.txt": "Foo",
      },
    });

    await repo.add({ path: "foo.txt" });

    await repo.indexStore.reload();

    const entries = repo.indexStore.index.entries();

    expect(entries.length).toBe(1);
    expect(entries[0]).toHaveProperty("file.path", "foo.txt");

    const blobObject = await repo.objects.findOne({
      type: "blob",
      id: entries[0].objectId,
    });

    expect(blobObject).toBeDefined();
    expect(blobObject.data).toEqual(Buffer.from("Foo"));
  });
});
