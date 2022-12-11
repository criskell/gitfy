export type ObjectType = typeof objectTypes[number];

const objectTypes = ["commit", "tree", "blob"] as const;

export const isObjectType = (test: string): test is ObjectType =>
  objectTypes.includes(test as ObjectType);

export type GitObject = CommitObject | TreeObject | BlobObject;

export interface RawObject {
  type: ObjectType;
  data: Buffer;
}

export interface BlobObject {
  type: "blob";
  data: Buffer;
}

export interface TreeObject {
  type: "tree";
  data: TreeEntry[];
}

export interface CommitObject {
  type: "commit";
  data: Commit;
}

export interface Commit {
  message: string;
  treeId: string;
  author: string;
  parentIds: string[];
  committer: string;
  gpgSignature?: string;
}

export interface TreeEntry {
  mode: number;
  path: string;
  objectId: string;
}
