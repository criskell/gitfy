import { generateObjectId } from "../../src/objects";
import { Tree, TreeEntry } from "../../src/objects/body/tree";

describe("objects/tree", () => {
  describe("Tree#from()", () => {
    it("deve desserializar uma árvore", () => {
      const fooId = generateObjectId(Buffer.from("bar.txt hash"));
      const barId = generateObjectId(Buffer.from("bar.txt hash"));

      const entries = Buffer.concat([
        Buffer.concat([
          Buffer.from("100644 foo.txt\0"),
          Buffer.from(fooId, "hex"),
        ]),
        Buffer.concat([
          Buffer.from("100644 bar.txt\0"),
          Buffer.from(barId, "hex"),
        ]),
      ]);

      const tree = Tree.from(entries);

      expect(tree.entries).toEqual([
        new TreeEntry("100644", "foo.txt", fooId),
        new TreeEntry("100644", "bar.txt", barId),
      ]);
    });
  });

  describe("tree.serialize()", () => {
    it("deve serializar uma árvore", () => {
      const fooId = generateObjectId(Buffer.from("bar.txt hash"));
      const barId = generateObjectId(Buffer.from("bar.txt hash"));

      const serializedEntries = Buffer.concat([
        Buffer.concat([
          Buffer.from("100644 foo.txt\0"),
          Buffer.from(fooId, "hex"),
        ]),
        Buffer.concat([
          Buffer.from("100644 bar.txt\0"),
          Buffer.from(barId, "hex"),
        ]),
      ]);

      const tree = new Tree([
        new TreeEntry("100644", "foo.txt", fooId),
        new TreeEntry("100644", "bar.txt", barId),
      ]);

      expect(tree.serialize()).toEqual(serializedEntries);
    });
  });
});