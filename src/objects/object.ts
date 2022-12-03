import * as blob from "./blob";
import { sha1 } from "../util/hash";

import { Wrapper } from "./wrapper";

export type ObjectId = string;
export type GitObject = blob.Blob;
export enum ObjectType {
  BLOB = "blob",
};

export const isValidType = (type: string): type is ObjectType => {
  return Object.values(ObjectType).includes(type as ObjectType);
};

export const serializeObject = (object: GitObject): Wrapper => {
  if (object.type === ObjectType.BLOB) return {
    type: ObjectType.BLOB,
    body: blob.serialize(object),
  };
};

export const deserializeObject = ({ type, body }: Wrapper): GitObject => {
  if (type === ObjectType.BLOB) return blob.deserialize(body);
};

export const generateObjectId = sha1;