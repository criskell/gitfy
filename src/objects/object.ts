import * as blob from "./blob";
import * as commit from "./commit";
import { sha1 } from "../util/hash";

import { Wrapper } from "./wrapper";

export type ObjectId = string;
export type GitObject = blob.Blob;
export enum ObjectType {
  BLOB = "blob",
  COMMIT = "commit",
}

export const isValidType = (type: string): type is ObjectType => {
  return Object.values(ObjectType).includes(type as ObjectType);
};

const serializers = {
  [ObjectType.BLOB]: blob.serialize,
  [ObjectType.COMMIT]: commit.serialize,
};

const deserializers = {
  [ObjectType.BLOB]: blob.deserialize,
  [ObjectType.COMMIT]: commit.deserialize,
};

export const serializeObject = (object: GitObject): Wrapper => {
  return {
    type: object.type,
    body: serializers[object.type](object),
  };
};

export const deserializeObject = ({ type, body }: Wrapper): GitObject => {
  return deserializers[type](body) as Extract<GitObject, { type: typeof type }>;
};

export const generateObjectId = sha1;
