import { generateObjectId } from "../../src/objects/object";
import { Tree, TreeEntry } from "../../src/objects/tree";

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
          Buffer.from("105644 bar.txt\0"),
          Buffer.from(barId, "hex"),
        ]),
      ]);

      const fooEntry = new TreeEntry;

      fooEntry.mode = "100644";
      fooEntry.path = "foo.txt";
      fooEntry.objectId = fooId;

      const barEntry = new TreeEntry;

      barEntry.mode = "105644";
      barEntry.path = "bar.txt";
      barEntry.objectId = barId;

      const tree = Tree.from(entries);

      expect(tree.entries).toEqual([fooEntry, barEntry]);
    });
  });

  describe("tree.serialize()", () => {
    it("deve serializar uma árvore", () => {
      const fooId = generateObjectId(Buffer.from("bar.txt hash"));
      const barId = generateObjectId(Buffer.from("bar.txt hash"));

      const fooEntry = new TreeEntry;

      fooEntry.mode = "100644";
      fooEntry.path = "foo.txt";
      fooEntry.objectId = fooId;

      const barEntry = new TreeEntry;

      barEntry.mode = "105644";
      barEntry.path = "bar.txt";
      barEntry.objectId = barId;

      const serializedEntries = Buffer.concat([
        Buffer.concat([
          Buffer.from("100644 foo.txt\0"),
          Buffer.from(fooId, "hex"),
        ]),
        Buffer.concat([
          Buffer.from("105644 bar.txt\0"),
          Buffer.from(barId, "hex"),
        ]),
      ]);

      const tree = new Tree;
      tree.entries = [fooEntry, barEntry];

      expect(tree.serialize()).toEqual(serializedEntries);
    });
  });
});