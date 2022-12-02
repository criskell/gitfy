import * as blob from "./blob";
import { ObjectType, GitObject } from "./object";

export const serializeObject = (object: GitObject): Buffer => {
  if (object.type === ObjectType.BLOB) return blob.serialize(object);
};

export const deserializeObject = (type: ObjectType, raw: Buffer): GitObject => {
  if (type === ObjectType.BLOB) return blob.deserialize(raw);
};