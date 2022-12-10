export type GitObject = Commit | Blob | Tree;

const objectTypes = ["commit", "tree", "blob"] as const;
export type ObjectType = typeof objectTypes[number];

export const isObjectType = (test: string): test is ObjectType =>
  objectTypes.includes(test as ObjectType);

export interface RawObject {
  type: ObjectType;
  raw: Buffer;
}

export interface Blob {
  type: "blob";
  content: Buffer;
}

export interface Commit {
  type: "commit";
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

export class Tree {
  type: "tree";
  entries: TreeEntry[];
}
