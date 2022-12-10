import { setupRepository } from "../__support__";
import { ObjectType } from "../../src/objects";

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

    const blobObject: any = await repo.objectStore.get(entries[0].objectId);

    expect(blobObject).toBeDefined();
    expect(blobObject.type).toBe("blob");
    expect(blobObject.content).toEqual(Buffer.from("Foo"));
  });
});
