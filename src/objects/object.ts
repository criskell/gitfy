import { Blob } from "./blob";
import { Commit } from "./commit";
import { sha1 } from "../util/hash";

import { Wrapper } from "./wrapper";

export type ObjectId = string;
export type GitObject = Blob | Commit;

export enum ObjectType {
  BLOB = "blob",
  COMMIT = "commit",
}

export const isObjectType = (type: string): type is ObjectType =>
  Object.values<string>(ObjectType).indexOf(type) !== -1;

export const generateObjectId = sha1;
