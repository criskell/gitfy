import util from "util";

import { GitObject, ObjectType, ObjectId } from "./object";
import { generateObjectId } from "./id";
import { serializeObject, deserializeObject } from "./serialization";
import { compress, decompress } from "../util/compression";

export type Wrapper = {
  objectId: ObjectId;
  data: Buffer;
};

export const wrapObject = async (obj: GitObject): Promise<Wrapper> => {
  const content = serializeObject(obj);
  const size = content.length;
  const header = Buffer.from(`${obj.type} ${size}\0`, "ascii");

  const raw = Buffer.concat([header, content]);
  const objectId = generateObjectId(raw);

  return {
    objectId,
    data: await compress(raw),
  };
};

export const unwrapObject = async (wrapped: Buffer): Promise<GitObject | null> => {
  const buf = await decompress(wrapped);

  const spaceIndex = buf.indexOf(0x20);
  const type = buf.toString("ascii", 0, spaceIndex);

  if (! Object.values(ObjectType).includes(type as ObjectType)) return null;

  const nullIndex = buf.indexOf(0x00);
  const size = parseInt(buf.toString("ascii", spaceIndex + 1, nullIndex));

  if (! Number.isFinite(size)) return null;

  const rawObject = buf.subarray(nullIndex + 1, nullIndex + size + 1);

  return deserializeObject(type as ObjectType, rawObject);
};