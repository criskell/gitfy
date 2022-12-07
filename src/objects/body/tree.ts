import { ObjectType, ObjectId } from '..';

export class TreeEntry {
  public constructor(
    public mode: string,
    public path: string,
    public objectId: ObjectId
  ) {
    //
  }

  public serialize(): Buffer {
    return Buffer.concat([
      Buffer.from(this.mode + ' ' + this.path + '\0'),
      Buffer.from(this.objectId, 'hex'),
    ]);
  }
}

export class Tree {
  public readonly type = ObjectType.TREE;

  public static from(rawTree: Buffer): Tree {
    const tree = new Tree();

    let cursor = 0;

    while (cursor < rawTree.length) {
      const spaceIndex = rawTree.indexOf(' ', cursor);
      const mode = rawTree.subarray(cursor, spaceIndex).toString();
      const nullIndex = rawTree.indexOf('\0', spaceIndex);
      const path = rawTree.subarray(spaceIndex + 1, nullIndex).toString();

      cursor = nullIndex + 1 + 20;

      const objectId = rawTree.subarray(nullIndex + 1, cursor).toString('hex');

      const entry = new TreeEntry(mode, path, objectId);

      tree.entries.push(entry);
    }

    return tree;
  }

  public constructor(public entries: TreeEntry[] = []) {
    //
  }

  public serialize(): Buffer {
    return Buffer.concat(this.entries.map((entry) => entry.serialize()));
  }
}
