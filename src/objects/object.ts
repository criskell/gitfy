import { Blob } from "./blob";
import { Commit } from "./commit";
import { Tree } from "./tree";
import { sha1 } from "../util/hash";

import { Wrapper } from "./wrapper";

export type ObjectId = string;
export type GitObject = Blob | Commit | Tree;

export enum ObjectType {
  BLOB = "blob",
  COMMIT = "commit",
  TREE = "tree",
}

export const isObjectType = (type: string): type is ObjectType =>
  Object.values<string>(ObjectType).indexOf(type) !== -1;

export const generateObjectId = sha1;
