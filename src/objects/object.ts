export type ObjectType = typeof objectTypes[number];

const objectTypes = ["commit", "tree", "blob"] as const;

export const isObjectType = (test: string): test is ObjectType =>
  objectTypes.includes(test as ObjectType);

export const isRawObject = (object: GitObject): object is RawObject =>
  Buffer.isBuffer(object.data) && object.type !== "blob";

export type GitObject = ParsedObject | RawObject;

export type ParsedObject = TreeObject | CommitObject | BlobObject;

export interface RawObject {
  type: ObjectType;
  data: Buffer;
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
