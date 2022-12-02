import { ObjectType } from "./object";

export interface Blob {
  type: ObjectType.BLOB;
  content: Buffer;
};

export const serialize = (blob: Blob): Buffer => {
  return blob.content;
};

export const deserialize = (raw: Buffer): Blob => {
  return {
    type: ObjectType.BLOB,
    content: raw,
  }
};