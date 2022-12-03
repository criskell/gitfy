import * as blob from "./blob";
import * as commit from "./commit";
import { sha1 } from "../util/hash";

import { Wrapper } from "./wrapper";

export type ObjectId = string;
export type GitObject = blob.Blob | commit.Commit;
export enum ObjectType {
  BLOB = "blob",
  COMMIT = "commit",
}

export const serializeObject = (object: GitObject): Wrapper => {
  let body: Buffer;

  if (object.type === ObjectType.BLOB) {
    body = blob.serialize(object);
  }

  if (object.type === ObjectType.COMMIT) {
    body = commit.serialize(object);
  }

  return {
    type: object.type,
    body,
  };
};

export const deserializeObject = ({ type, body }: Wrapper) => {
  if (type === ObjectType.BLOB) {
    return blob.deserialize(body);
  }

  if (type === ObjectType.COMMIT) {
    return commit.deserialize(body);
  }
};

export const generateObjectId = sha1;
