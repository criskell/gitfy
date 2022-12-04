import { ObjectType, ObjectId } from "./object";

export class TreeEntry {
  public mode: string;
  public path: string;
  public objectId: ObjectId;

  public serialize(): Buffer {
    return Buffer.concat([
      Buffer.from(this.mode + " " + this.path + "\0"),
      Buffer.from(this.objectId, "hex"),
    ]);
  }
}

export class Tree {
  public readonly type = ObjectType.TREE;
  public entries: TreeEntry[] = [];

  public static from(raw: Buffer): Tree {
    const tree = new Tree();

    let cursor = 0;

    while (cursor < raw.length) {
      const spaceIndex = raw.indexOf(" ", cursor);
      const mode = raw.subarray(cursor, spaceIndex).toString();
      const nullIndex = raw.indexOf("\0", spaceIndex);
      const path = raw.subarray(spaceIndex + 1, nullIndex).toString();

      cursor = nullIndex + 1 + 20;

      const objectId = raw.subarray(nullIndex + 1, cursor).toString("hex");

      const entry = new TreeEntry;

      entry.mode = mode;
      entry.path = path;
      entry.objectId = objectId;

      tree.entries.push(entry);
    }

    return tree;
  }

  public serialize(): Buffer {
    return Buffer.concat(this.entries.map((entry) => entry.serialize()));
  }
}