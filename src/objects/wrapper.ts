import util from "util";

import { GitObject, ObjectType } from "./object";
import { serializeObject, deserializeObject } from "./serialization";
import { compress, decompress } from "../util/compression";

export const wrapObject = async (obj: GitObject): Promise<Buffer> => {
  const content = serializeObject(obj);
  const size = content.length;
  const header = Buffer.from(`${obj.type} ${size}\0`, "ascii");

  return await compress(Buffer.concat([header, content]));
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