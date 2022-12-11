export type ObjectType = typeof objectTypes[number];

const objectTypes = ["commit", "tree", "blob"] as const;

export const isObjectType = (test: string): test is ObjectType =>
  objectTypes.includes(test as ObjectType);

export type GitObject = ParsedObject | RawObject;

export type ParsedObject = TreeObject | CommitObject | BlobObject;

export class RawObject {
  public type: ObjectType;
  public data: Buffer;

  constructor(options: GitObject) {
    Object.assign(this, options);
  }
}

export interface BlobObject {
  type: "blob";
  data: Buffer;
}

export interface CommitObject {
  type: "commit";
  data: {
    message: string;
    treeId: string;
    author: string;
    parentIds: string[];
    committer: string;
    gpgSignature?: string;
  };
}

export interface TreeEntry {
  mode: number;
  path: string;
  objectId: string;
}

export interface TreeObject {
  type: "tree";
  data: TreeEntry[];
}
